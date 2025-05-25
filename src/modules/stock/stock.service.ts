import { Injectable } from '@nestjs/common';
import { CreateStockDto } from './dto/create-stock.dto';
import { UpdateStockDto } from './dto/update-stock.dto';
import { PrismaService } from '../prisma/prisma.service';
import { QueryStockDto } from './dto/query-stock.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class StockService {
  constructor(private prisma: PrismaService) {}

  create(createStockDto: CreateStockDto) {
    return 'This action adds a new stock';
  }

  findAll() {
    return `This action returns all stock`;
  }

  findOne(id: number) {
    return `This action returns a #${id} stock`;
  }

  async findByWarehouse(id: number, query: QueryStockDto) {
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
              stocks: {
                where: { warehouseId: id },
              },
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
            stocks: true,
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
