import { Injectable } from '@nestjs/common';
import { CreateStockDto } from './dto/create-stock.dto';
import { UpdateStockDto } from './dto/update-stock.dto';
import { PrismaService } from '../prisma/prisma.service';

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

  async findByWarehouse(id: number) {
    const warehouseStock = await this.prisma.product.findMany({
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
    });

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
        productId: product.id,
        productName: product.name,
        productImages: product.images,
        totalStock,
        skus: skuDetails,
      };
    });
    return { data: formatted };
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
      }
    });
    return { data: res };
    // const res = await this.prisma.stock.findMany({
    //   where: {
    //     warehouseId: id,
    //   },
    //   include: {
    //     sku: {
    //       include: {
    //         product: {
    //           select: {
    //             images: true,
    //           },
    //         },
    //         productSkuAttributes: {
    //           include: {
    //             attributeValue: {
    //               include: {
    //                 attribute: {
    //                   select: {
    //                     label: true
    //                   }
    //                 },
    //               }
    //             },
    //           }
    //         },
    //       },
    //     },
    //     warehouse: true,
    //   },
    // });

    // return { data: res };
  }

  remove(id: number) {
    return `This action removes a #${id} stock`;
  }
}
