import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { convertToSlug } from 'src/utils/convertToSlug';
import { Prisma } from '@prisma/client';

@Injectable()
export class CategoryService {
  constructor(private prisma: PrismaService) {}
  create(createCategoryDto: CreateCategoryDto) {
    const payload = { ...createCategoryDto };
    const slug = convertToSlug(createCategoryDto.name);
    payload.slug = slug;
    return this.prisma.category.create({ data: payload });
  }

  async findAll() {
    const [res, total] = await Promise.all([
      this.prisma.category.findMany(),
      this.prisma.category.count(),
    ]);
    return {
      data: res,
      total,
    };
  }

  async adminFindAll() {
    const [res, total] = await Promise.all([
      this.prisma.category.findMany(),
      this.prisma.category.count(),
    ]);

    return {
      data: res,
      total,
      message: 'Admin category list retrieved successfully',
    };
  }

  async findOne(id: number) {
    const res = await this.prisma.category.findUnique({ where: { id } });
    return { data: res };
  }

  async findOneBySlug(slug: string) {
    const res = await this.prisma.category.findUnique({ where: { slug } });
    return { data: res };
  }

  async getCategoryInitial() {
    return await this.prisma.category.findMany({
      select: { id: true, name: true },
    });
  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto) {
    const res = await this.prisma.category.update({
      where: { id },
      data: updateCategoryDto,
    });
    return { data: res };
  }

  async softDelete(id: number): Promise<{ deleteCount: number }> {
    const entity = await this.prisma.category.findUnique({
      where: { id, isDeleted: false },
    });

    if (!entity) {
      throw new NotFoundException('Category not found');
    }
    await this.prisma.category.update({
      where: { id },
      data: { isDeleted: true },
    });
    return {
      deleteCount: 1,
    };
  }

  async restoreProduct(id: number) {
    const entity = await this.prisma.category.findUnique({
      where: { id, isDeleted: true },
    });

    if (!entity) {
      throw new NotFoundException('Category not found');
    }
    await this.prisma.category.update({
      where: { id },
      data: { isDeleted: false },
    });
    return {
      message: 'Category restored successfully',
    };
  }

  async forceDelete(id: number) {
    await this.prisma.category.delete({
      where: { id },
    });
    return {
      message: 'Category deleted successfully',
    };
  }
}
