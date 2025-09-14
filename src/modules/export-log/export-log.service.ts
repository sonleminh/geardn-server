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
import { ExportType } from '@prisma/client';

@Injectable()
export class ExportLogService {
  private readonly logger = new Logger(ExportLogService.name);
  constructor(private prisma: PrismaService) {}

  async create(createExportLogDto: CreateExportLogDto, userId: number) {
    const { warehouseId, type, note, exportDate, items } = createExportLogDto;

    const existedWarehouse = await this.prisma.warehouse.findUnique({
      where: { id: warehouseId, isDeleted: false },
    });

    if (!existedWarehouse) {
      throw new NotFoundException('Warehouse not found');
    }

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
        for (const item of mergedItems) {
          const stock = await tx.stock.findUnique({
            where: {
              skuId_warehouseId: { skuId: item.skuId, warehouseId },
            },
          });
          if (!stock || Number(stock.quantity) < item.quantity) {
            throw new BadRequestException(
              `Not enough stock for SKU ${item.skuId}. Available: ${stock?.quantity ?? 0}`,
            );
          }
        }

        const today = new Date();
        const localToday = today
          .toLocaleDateString('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' }) // YYYY-MM-DD
          .replace(/-/g, '');
        const countToday = await tx.exportLog.count({
          where: {
            createdAt: {
              gte: new Date(new Date().setHours(0, 0, 0, 0)),
              lte: new Date(new Date().setHours(23, 59, 59, 999)),
            },
          },
        });
        const referenceCode = `EXP-${localToday}-${String(countToday + 1).padStart(4, '0')}`;

        const exportLog = await tx.exportLog.create({
          data: {
            warehouseId: warehouseId,
            createdBy: userId,
            type,
            note,
            referenceCode,
            exportDate,
          },
        });

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

        for (const item of mergedItems) {
          await tx.stock.update({
            where: {
              skuId_warehouseId: {
                skuId: item.skuId,
                warehouseId,
              },
            },
            data: {
              quantity: {
                decrement: item.quantity,
              },
            },
          });
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

  async findAll(params: {
    warehouseIds?: number[];
    types?: ExportType[];
    sort?: 'asc' | 'desc';
    productIds?: number[];
    fromDate?: string;
    toDate?: string;
    page?: number;
    limit?: number;
  }) {
    const { warehouseIds, types, sort, productIds, fromDate, toDate, page = 1, limit = 10 } = params;

    const skip = (page - 1) * limit;

    const [total, data] = await Promise.all([
      this.prisma.exportLog.count({
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
      this.prisma.exportLog.findMany({
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
    const res = await this.prisma.exportLog.findUnique({
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
      throw new NotFoundException('Export log not found');
    }

    return { data: res };
  }
}
