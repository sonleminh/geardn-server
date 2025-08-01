import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FindStocksDto } from './dto/query-stock.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class StockService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: FindStocksDto) {
    const { page = 1, limit = 10, search } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = search
      ? {
          OR: [
            { name: { contains: search, mode: Prisma.QueryMode.insensitive } },
            {
              skus: {
                some: {
                  sku: { contains: search, mode: Prisma.QueryMode.insensitive },
                },
              },
            },
          ],
        }
      : {};

    const [warehouseStock, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          skus: {
            include: {
              stocks: true,
              productSkuAttributes: {
                include: {
                  attributeValue: {
                    select: {
                      value: true,
                    },
                  },
                },
              },
            },
          },
        },
      }),
      this.prisma.product.count({ where }),
    ]);

    const formatted = warehouseStock.map((product) => {
      const skuDetails = product.skus.map((sku) => {
        const stockQuantity = sku.stocks.reduce(
          (sum, s) => sum + s.quantity,
          0,
        );
        return {
          id: sku.id,
          sku: sku.sku,
          imageUrl: sku.imageUrl,
          quantity: stockQuantity,
          productSkuAttributes: sku.productSkuAttributes,
        };
      });

      const totalStock = skuDetails.reduce((sum, s) => sum + s.quantity, 0);

      return {
        id: product.id,
        name: product.name,
        images: product.images,
        totalStock,
        skus: skuDetails,
      };
    });

    return {
      data: formatted,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findByProduct(id: number) {
    const res = await this.prisma.product.findUnique({
      where: {
        id,
      },
      include: {
        skus: {
          include: {
            stocks: {
              select: {
                id: true,
                quantity: true,
                unitCost: true,
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
    });
    return { data: res };
  }

  remove(id: number) {
    return `This action removes a #${id} stock`;
  }
}
