import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from 'src/modules/prisma/prisma.service';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}
  async create(createProductDto: CreateProductDto) {
    const res = await this.prisma.product.create({ data: createProductDto });
    return { status: HttpStatus.CREATED, message: 'success', data: res };
  }

  async findAll() {
    const [res, total] = await Promise.all([
      this.prisma.product.findMany(),
      this.prisma.product.count(),
    ]);
    return {
      products: res,
      total,
      status: HttpStatus.OK,
      message: 'success',
    };
  }

  async findOne(id: number) {
    const res = await this.prisma.product.findUnique({ where: { id } });
    return { status: HttpStatus.OK, message: 'success', data: res };
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    const res = await this.prisma.product.update({
      where: { id },
      data: updateProductDto,
    });
    return { status: HttpStatus.OK, message: 'success', data: res };
  }

  async softDelete(id: number): Promise<{ deleteCount: number }> {
    const entity = await this.prisma.product.findUnique({
      where: { id, is_deleted: false },
    });

    if (!entity) {
      throw new NotFoundException('Đối tượng không tồn tại!!');
    }
    await this.prisma.product.update({
      where: { id },
      data: { is_deleted: true },
    });
    return {
      deleteCount: 1,
    };
  }

  remove(id: number) {
    return this.prisma.product.delete({ where: { id } });
  }
}
