import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as dayjs from 'dayjs';
import { Decimal } from '@prisma/client/runtime/library';
import { CreateAdjustmentLogDto } from './dto/create-adjustment-log.dto';

@Injectable()
export class AdjustmentLogService {
  private readonly logger = new Logger(AdjustmentLogService.name);
  constructor(private prisma: PrismaService) {}

  async create(createAdjustmentLogDto: CreateAdjustmentLogDto, userId: number) {
    const { warehouseId, reason, type, note, items } = createAdjustmentLogDto;

    if (!items || items.length === 0) {
      throw new BadRequestException('At least one item is required.');
    }

    // Validate warehouse
    const existedWarehouse = await this.prisma.warehouse.findUnique({
      where: { id: warehouseId, isDeleted: false },
    });
    if (!existedWarehouse) {
      throw new NotFoundException('Warehouse not found');
    }

    // Merge SKU adjustment nếu bị trùng
    const mergedItemsMap = new Map<
      number,
      {
        quantityBefore: number;
        quantityChange: number;
        costPriceBefore: Decimal;
      }
    >();
    for (const item of items) {
      if (item.quantityChange === 0) {
        throw new BadRequestException(
          `Quantity cannot be zero for SKU ${item.skuId}`,
        );
      }
      if (mergedItemsMap.has(item.skuId)) {
        const existing = mergedItemsMap.get(item.skuId)!;
        existing.quantityBefore += item.quantityBefore;
        existing.quantityChange += item.quantityChange;
        existing.costPriceBefore = item.costPriceBefore;
      } else {
        mergedItemsMap.set(item.skuId, {
          quantityBefore: item.quantityBefore,
          quantityChange: item.quantityChange,
          costPriceBefore: item.costPriceBefore,
        });
      }
    }

    const mergedItems = Array.from(mergedItemsMap.entries()).map(
      ([skuId, value]) => ({
        skuId,
        ...value,
      }),
    );

    try {
      await this.prisma.$transaction(async (tx) => {
        // Validate SKU có tồn tại không
        for (const item of mergedItems) {
          const sku = await tx.productSKU.findUnique({
            where: { id: item.skuId },
          });
          if (!sku) {
            throw new NotFoundException(`SKU ${item.skuId} not found`);
          }
        }

        const today = dayjs().format('YYYYMMDD');
        const countToday = await tx.exportLog.count({
          where: {
            createdAt: {
              gte: dayjs().startOf('day').toDate(),
              lte: dayjs().endOf('day').toDate(),
            },
          },
        });

        const referenceCode = `ADJ-${today}-${String(countToday + 1).padStart(4, '0')}`;

        // Tạo adjustment log
        const adjustmentLog = await tx.adjustmentLog.create({
          data: {
            warehouseId,
            reason,
            type,
            note,
            referenceCode,
            createdBy: userId,
          },
        });

        // Tạo adjustment log item
        const adjustmentLogItems = mergedItems.map((item) => ({
          adjustmentLogId: adjustmentLog.id,
          skuId: item.skuId,
          warehouseId: warehouseId,
          quantityBefore: item.quantityBefore,
          quantityChange: item.quantityChange,
          costPriceBefore: item.costPriceBefore,
        }));

        await tx.adjustmentLogItem.createMany({
          data: adjustmentLogItems,
        });

        // Cập nhật stock
        for (const item of mergedItems) {
          const existingStock = await tx.stock.findUnique({
            where: {
              skuId_warehouseId: {
                skuId: item.skuId,
                warehouseId,
              },
            },
          });

          if (!existingStock) {
            throw new BadRequestException(
              `Stock for SKU ${item.skuId} in warehouse ${warehouseId} not found`,
            );
          }

          const realQuantity =
            type === 'INCREASE' ? item.quantityChange : -item.quantityChange;

          await tx.stock.update({
            where: {
              skuId_warehouseId: {
                skuId: item.skuId,
                warehouseId,
              },
            },
            data: {
              quantity: {
                increment: realQuantity,
              },
            },
          });
        }

        return adjustmentLog;
      });

      return {
        message: 'Adjustment log created successfully',
      };
    } catch (error) {
      this.logger.error('Failed to create adjustment log', error);
      throw new InternalServerErrorException('Failed to create adjustment log');
    }
  }

  async findAll() {
    return this.prisma.adjustmentLog.findMany({
      include: {
        warehouse: true,
        items: {
          include: {
            sku: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const res = await this.prisma.adjustmentLog.findUnique({
      where: { id },
      include: {
        warehouse: true,
        items: {
          include: {
            sku: true,
          },
        },
      },
    });

    if (!res) {
      throw new NotFoundException('Adjustment log not found');
    }

    return { data: res };
  }
}
