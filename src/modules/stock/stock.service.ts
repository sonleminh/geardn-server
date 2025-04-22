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
            }
            // stocks: {
            //   where: { warehouseId: id }
            // }
          }
        }
      }
    });
    return { data: warehouseStock };
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
