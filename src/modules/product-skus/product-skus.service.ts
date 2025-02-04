import { Injectable } from '@nestjs/common';
import { CreateProductSkusDto } from './dto/create-product-skus.dto';
import { UpdateProductSkusDto } from './dto/update-product-skus.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProductSkusService {
  constructor(private prisma: PrismaService) {}
  create(createProductSkusDto: CreateProductSkusDto) {
    return this.prisma.productSKU.create({
      data: {
        sku: createProductSkusDto.sku,
        price: createProductSkusDto.price,
        quantity: createProductSkusDto.quantity,
        product: {
          connect: {
            id: createProductSkusDto.productId,
          },
        },
        attributes: {
          create: createProductSkusDto.attributes,
        },
      },
    });
  }

  findAll() {
    return `This action returns all productSkus`;
  }

  findOne(id: number) {
    return `This action returns a #${id} productSkus`;
  }

  update(id: number, updateProductSkusDto: UpdateProductSkusDto) {
    return `This action updates a #${id} productSkus`;
  }

  remove(id: number) {
    return `This action removes a #${id} productSkus`;
  }
}
