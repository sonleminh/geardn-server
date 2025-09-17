import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WarehouseService {
  constructor(private prisma: PrismaService) {}

  create(createWarehouseDto: CreateWarehouseDto) {
    return this.prisma.warehouse.create({ data: createWarehouseDto });
  }

  async findAll() {
    const [res, total] = await Promise.all([
      this.prisma.warehouse.findMany(),
      this.prisma.warehouse.count(),
    ]);

    return {
      data: res,
      total,
    };
  }

  async adminFindAll() {
    const [res, total] = await Promise.all([
      this.prisma.warehouse.findMany(),
      this.prisma.warehouse.count(),
    ]);

    return {
      data: res,
      total,
    };
  }

  async findOne(id: number) {
    const res = await this.prisma.warehouse.findUnique({ where: { id } });
    return { data: res };
  }

  async update(id: number, updateCategoryDto: UpdateWarehouseDto) {
    const res = await this.prisma.warehouse.update({
      where: { id },
      data: updateCategoryDto,
    });
    return { data: res };
  }

  async softDelete(id: number) {
    const entity = await this.prisma.warehouse.findUnique({
      where: { id, isDeleted: false },
    });

    if (!entity) {
      throw new NotFoundException('Đối tượng không tồn tại!!');
    }
    return await this.prisma.warehouse.update({
      where: { id },
      data: { isDeleted: true },
    });
  }

  async restore(id: number) {
    const entity = await this.prisma.warehouse.findUnique({
      where: { id, isDeleted: true },
    });

    if (!entity) {
      throw new NotFoundException('Warehouse not found');
    }
    await this.prisma.warehouse.update({
      where: { id },
      data: { isDeleted: false },
    });
    return {
      message: 'Warehouse restored successfully',
    };
  }

  async forceDelete(id: number) {
    await this.prisma.warehouse.delete({
      where: { id },
    });
    return {
      message: 'Warehouse deleted successfully',
    };
  }
}
