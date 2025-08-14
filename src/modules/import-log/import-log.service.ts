import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateImportLogDto } from './dto/create-import-log.dto';
import * as dayjs from 'dayjs';
import { Decimal } from '@prisma/client/runtime/library';
import { ImportType } from '@prisma/client';

@Injectable()
export class ImportLogService {
  private readonly logger = new Logger(ImportLogService.name);
  constructor(private prisma: PrismaService) {}

  async create(createImportLogDto: CreateImportLogDto, userId: number) {
    const { warehouseId, type, note, importDate, items } = createImportLogDto;

    if (!items || items.length === 0) {
      throw new BadRequestException('At least one item is required.');
    }

    // Merge duplicated SKU
    const mergedItemsMap = new Map<
      number,
      { quantity: number; unitCost: Decimal; note?: string }
    >();

    for (const item of items) {
      if (item.quantity <= 0 || Number(item.unitCost) < 0) {
        throw new BadRequestException(
          `Invalid quantity or price for SKU ${item.skuId}`,
        );
      }

      if (mergedItemsMap.has(item.skuId)) {
        const existing = mergedItemsMap.get(item.skuId)!;
        existing.quantity += item.quantity;
        existing.unitCost = item.unitCost; // Keep latest price (or handle average if needed)
      } else {
        mergedItemsMap.set(item.skuId, {
          quantity: item.quantity,
          unitCost: item.unitCost,
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
        const countToday = await tx.importLog.count({
          where: {
            createdAt: {
              gte: dayjs().startOf('day').toDate(),
              lte: dayjs().endOf('day').toDate(),
            },
          },
        });

        const referenceCode = `IMP-${today}-${String(countToday + 1).padStart(4, '0')}`;

        // 1. Tạo bản ghi import log
        const importLog = await tx.importLog.create({
          data: {
            warehouseId: warehouseId,
            createdBy: userId,
            type,
            note,
            referenceCode,
            importDate,
          },
        });

        // 2. Tạo các import log item liên kết với import log vừa tạo
        const importLogItems = mergedItems.map((item) => ({
          importLogId: importLog.id,
          skuId: item.skuId,
          quantity: item.quantity,
          unitCost: item.unitCost,
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
            const oldUnitCost = Number(existingStock?.unitCost) ?? 0;
            const importQty = Number(item.quantity);
            const importPrice = Number(item.unitCost);

            const newUnitCost =
              (oldQty * oldUnitCost + importQty * importPrice) /
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
                unitCost: newUnitCost,
              },
            });
          } else {
            await tx.stock.create({
              data: {
                skuId: item.skuId,
                warehouseId,
                quantity: item.quantity,
                unitCost: item.unitCost,
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

  async findAll(params: {
    warehouseIds?: number[];
    types?: ImportType[];
    sort?: 'asc' | 'desc';
    productIds?: number[];
    fromDate?: string;
    toDate?: string;
    page?: number;
    limit?: number;
  }) {
    const {
      warehouseIds,
      types,
      sort,
      productIds,
      fromDate,
      toDate,
      page = 1,
      limit = 10,
    } = params;

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.importLog.findMany({
        where: {
          ...(warehouseIds &&
            warehouseIds.length > 0 && {
              warehouseId: { in: warehouseIds },
            }),
          ...(types && types.length > 0 && { type: { in: types } }),
          ...(fromDate &&
            toDate && {
              createdAt: {
                gte: dayjs(fromDate).startOf('day').toDate(),
                lte: dayjs(toDate).endOf('day').toDate(),
              },
            }),
          ...(productIds &&
            productIds.length > 0 && {
              items: {
                some: {
                  sku: {
                    productId: { in: productIds },
                  },
                },
              },
            }),
        },
        include: {
          warehouse: true,
          items: {
            include: {
              sku: {
                include: {
                  product: {
                    select: {
                      name: true,
                      images: true,
                    },
                  },
                  productSkuAttributes: {
                    include: {
                      attributeValue: {
                        select: {
                          attribute: {
                            select: {
                              label: true,
                            },
                          },
                          value: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: sort,
        },
        skip,
        take: limit,
      }),
      this.prisma.importLog.count({
        where: {
          ...(warehouseIds &&
            warehouseIds.length > 0 && {
              warehouseId: { in: warehouseIds },
            }),
          ...(types && types.length > 0 && { type: { in: types } }),
          ...(fromDate &&
            toDate && {
              createdAt: {
                gte: dayjs(fromDate).startOf('day').toDate(),
                lte: dayjs(toDate).endOf('day').toDate(),
              },
            }),
          ...(productIds &&
            productIds.length > 0 && {
              items: {
                some: {
                  sku: {
                    productId: { in: productIds },
                  },
                },
              },
            }),
        },
      }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number) {
    const res = await this.prisma.importLog.findUnique({
      where: { id },
      include: {
        warehouse: true,
        items: {
          include: {
            sku: {
              select: {
                product: {
                  select: {
                    name: true,
                  },
                },
                imageUrl: true,
                productSkuAttributes: {
                  include: {
                    attributeValue: {
                      select: {
                        value: true,
                        attribute: {
                          select: {
                            label: true,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        user: {
          select: {
            name: true,
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
