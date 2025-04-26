import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExportLogDto } from './dto/create-export-log.dto';
import * as dayjs from 'dayjs';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class ExportLogService {
  private readonly logger = new Logger(ExportLogService.name);
  constructor(private prisma: PrismaService) {}

  async create(createExportLogDto: CreateExportLogDto, userId: number) {
    const { warehouseId, type, note, items } = createExportLogDto;

    if (!items || items.length === 0) {
      throw new BadRequestException('At least one item is required.');
    }

    // Merge duplicated SKU
    const mergedItemsMap = new Map<
      number,
      { quantity: number; costPrice: Decimal; note?: string }
    >();

    for (const item of items) {
      if (item.quantity <= 0 || Number(item.costPrice) < 0) {
        throw new BadRequestException(
          `Invalid quantity or cost price for SKU ${item.skuId}`,
        );
      }

      if (mergedItemsMap.has(item.skuId)) {
        const existing = mergedItemsMap.get(item.skuId)!;
        existing.quantity += item.quantity;
        existing.costPrice = item.costPrice; // Keep latest price (or handle average if needed)
      } else {
        mergedItemsMap.set(item.skuId, {
          quantity: item.quantity,
          costPrice: item.costPrice,
          note: item.note,
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
        const today = dayjs().format('YYYYMMDD');
        const countToday = await tx.exportLog.count({
          where: {
            createdAt: {
              gte: dayjs().startOf('day').toDate(),
              lte: dayjs().endOf('day').toDate(),
            },
          },
        });

        const referenceCode = `EXP-${today}-${String(countToday + 1).padStart(4, '0')}`;

        // 1. Tạo bản ghi import log
        const exportLog = await tx.exportLog.create({
          data: {
            warehouseId: warehouseId,
            createdBy: userId,
            type,
            note,
            referenceCode,
          },
        });

        // 2. Tạo các import log item liên kết với import log vừa tạo
        const exportLogItems = mergedItems.map((item) => ({
          exportLogId: exportLog.id,
          skuId: item.skuId,
          quantity: item.quantity,
          costPrice: item.costPrice,
          note: item.note,
        }));

        await tx.exportLogItem.createMany({
          data: exportLogItems,
        });

        for (const item of items) {
          const existingStock = await tx.stock.findUnique({
            where: {
              skuId_warehouseId: {
                skuId: item.skuId,
                warehouseId,
              },
            },
          });

          if (existingStock) {
            const oldQty = Number(existingStock.quantity);
            const oldCostPrice = Number(existingStock?.costPrice) ?? 0;
            const importQty = Number(item.quantity);
            const importPrice = Number(item.costPrice);

            const newCostPrice =
              (oldQty * oldCostPrice + importQty * importPrice) /
              (oldQty + importQty);

            await tx.stock.update({
              where: {
                skuId_warehouseId: {
                  skuId: item.skuId,
                  warehouseId,
                },
              },
              data: {
                quantity: {
                  increment: item.quantity,
                },
                costPrice: newCostPrice,
              },
            });
          } else {
            await tx.stock.create({
              data: {
                skuId: item.skuId,
                warehouseId,
                quantity: item.quantity,
                costPrice: item.costPrice,
              },
            });
          }
        }
        return exportLog;
      });
      return {
        message: 'Export log created successfully',
      };
    } catch (error) {
      this.logger.error('Failed to create export log', error);
      throw new InternalServerErrorException('Failed to create export log');
    }
  }

  async findAll() {
    return this.prisma.exportLog.findMany({
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
    const res = await this.prisma.exportLog.findUnique({
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
      throw new NotFoundException('Import log not found');
    }

    return { data: res };
  }
}
