import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateProductAttributeDto } from './dto/create-product-attribute.dto';
import { UpdateProductAttributeDto } from './dto/update-product-attribute.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProductAttributesService {
  constructor(private prisma: PrismaService) {}

  create(createProductAttributeDto: CreateProductAttributeDto) {
    return this.prisma.productAttribute.create({
      data: createProductAttributeDto,
    });
  }

  async findAll() {
    const [res, total] = await Promise.all([
      this.prisma.productAttribute.findMany(),
      this.prisma.productAttribute.count(),
    ])
    return {
      categories: res,
      total,
      status: HttpStatus.OK,
      message: 'success',
    };
  }

  async findOne(id: number) {
    const res = await this.prisma.productAttribute.findUnique({
      where: { id },
    });
    return { status: HttpStatus.OK, message: 'success', data: res };
  }

  async update(
    id: number,
    updateProductAttributeDto: UpdateProductAttributeDto,
  ) {
    const res = await this.prisma.productAttribute.update({
      where: { id },
      data: updateProductAttributeDto,
    });
    return { status: HttpStatus.OK, message: 'success', data: res };
  }

  remove(id: number) {
    return this.prisma.productAttribute.delete({ where: { id } });
  }
}
