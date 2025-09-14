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
import { FindAdjustmentLogsDto } from './dto/find-adjustment-logs.dto';
import {
  createArrayFilter,
  createDateRangeFilter,
} from '../../common/helpers/query.helper';

@Injectable()
export class AdjustmentLogService {
  private readonly logger = new Logger(AdjustmentLogService.name);
  constructor(private prisma: PrismaService) {}

  async create(createAdjustmentLogDto: CreateAdjustmentLogDto, userId: number) {
    const { warehouseId, reason, type, note, adjustmentDate, items } =
      createAdjustmentLogDto;

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
      } else {
        mergedItemsMap.set(item.skuId, {
          quantityBefore: item.quantityBefore,
          quantityChange: item.quantityChange,
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

        const referenceCode = `ADJ-${localToday}-${String(countToday + 1).padStart(4, '0')}`;
        // Tạo adjustment log
        const adjustmentLog = await tx.adjustmentLog.create({
          data: {
            warehouseId,
            reason,
            type,
            note,
            referenceCode,
            adjustmentDate,
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

          await tx.stock.update({
            where: {
              skuId_warehouseId: {
                skuId: item.skuId,
                warehouseId,
              },
            },
            data: {
              quantity: item.quantityChange,
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

  async findAll(query: FindAdjustmentLogsDto) {
    const {
      warehouseIds,
      types,
      sort,
      productIds,
      fromDate,
      toDate,
      page = 1,
      limit = 10,
    } = query;

    const skip = (page - 1) * limit;

    const where = {
      ...(createArrayFilter(warehouseIds) && {
        warehouseId: createArrayFilter(warehouseIds),
      }),
      ...(createArrayFilter(types) && {
        type: createArrayFilter(types),
      }),
      ...(createDateRangeFilter(fromDate, toDate) && {
        createdAt: createDateRangeFilter(fromDate, toDate),
      }),
      ...(productIds?.length > 0 && {
        items: {
          some: {
            sku: {
              productId: { in: productIds },
            },
          },
        },
      }),
    };

    const [total, data] = await Promise.all([
      this.prisma.adjustmentLog.count({ where }),
      this.prisma.adjustmentLog.findMany({
        where,
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
          createdAt: sort || 'desc',
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
    const res = await this.prisma.adjustmentLog.findUnique({
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
                sellingPrice: true,
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
      throw new NotFoundException('Adjustment log not found');
    }

    return { data: res };
  }
}
