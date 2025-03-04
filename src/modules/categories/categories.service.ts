import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { convertToSlug } from 'src/utils/convertToSlug';

@Injectable()
export class CategoriesService {
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
    ])
    return {
      data: res,
      total,
      message: 'success',
    };
  }

  async findOne(id: number) {
    const res = await this.prisma.category.findUnique({ where: { id } });
    return { message: 'success', data: res };
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
    return { message: 'success', data: res };
  }

  remove(id: number) {
    return this.prisma.category.delete({ where: { id } });
  }
}
