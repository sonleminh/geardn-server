import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateImportLogDto } from './dto/create-import-log.dto';

@Injectable()
export class ImportLogService {
  private readonly logger = new Logger(ImportLogService.name);
  constructor(private prisma: PrismaService) {}

  async create(createImportLogDto: CreateImportLogDto, userId: number) {
    const { warehouseId, type, note, items } = createImportLogDto;

    if (!items || items.length === 0) {
      throw new BadRequestException('At least one item is required.');
    }

    // Merge duplicated SKU
    const mergedItemsMap = new Map<
      number,
      { quantity: number; price: number; note?: string }
    >();

    for (const item of items) {
      if (item.quantity <= 0 || item.price < 0) {
        throw new BadRequestException(
          `Invalid quantity or price for SKU ${item.skuId}`,
        );
      }

      if (mergedItemsMap.has(item.skuId)) {
        const existing = mergedItemsMap.get(item.skuId)!;
        existing.quantity += item.quantity;
        existing.price = item.price; // Keep latest price (or handle average if needed)
      } else {
        mergedItemsMap.set(item.skuId, {
          quantity: item.quantity,
          price: item.price,
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
        // 1. Tạo bản ghi import log
        const importLog = await tx.importLog.create({
          data: {
            warehouseId: warehouseId,
            createdBy: userId,
            type,
            note,
          },
        });

        // 2. Tạo các import log item liên kết với import log vừa tạo
        const importLogItems = mergedItems.map((item) => ({
          importLogId: importLog.id,
          skuId: item.skuId,
          quantity: item.quantity,
          price: item.price,
          note: item.note,
        }));

        await tx.importLogItem.createMany({
          data: importLogItems,
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
            const importPrice = Number(item.price);

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
                costPrice: item.price,
              },
            });
          }
        }
        return importLog;
      });
      return {
        message: 'Import log created successfully',
      };
    } catch (error) {
      this.logger.error('Failed to create import log', error);
      throw new InternalServerErrorException('Failed to create import log');
    }
  }

  async findAll() {
    return this.prisma.importLog.findMany({
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
    const res = await this.prisma.importLog.findUnique({
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
