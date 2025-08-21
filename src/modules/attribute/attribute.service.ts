import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAttributeDto } from './dto/create-attribute.dto';
import { UpdateAttributeDto } from './dto/update-attribute.dto';

@Injectable()
export class AttributeService {
  constructor(private prisma: PrismaService) {}

  async create(createAttributeDto: CreateAttributeDto) {
    const res = await this.prisma.attribute.create({
      // return this.prisma.attribute.create({
      data: createAttributeDto,
    });
    await this.prisma.outbox.create({
      data: {
        eventType: 'ATTRIBUTE_CREATED',
        payload: { attributeId: res.id },
      },
    });
    return res;
  }

  async findAll() {
    const [res, total] = await Promise.all([
      this.prisma.attribute.findMany({ where: { isDeleted: false } }),
      this.prisma.attribute.count(),
    ]);
    return {
      data: res,
      total,
    };
  }

  async adminFindAll() {
    const [res, total] = await Promise.all([
      this.prisma.attribute.findMany(),
      this.prisma.attribute.count(),
    ]);
    return {
      data: res,
      total,
    };
  }
  async findOne(id: number) {
    const res = await this.prisma.attribute.findUnique({
      where: { id },
    });
    return { data: res };
  }

  // async findByType(type: string) {
  //   const res = await this.prisma.attributeValue.findMany({
  //     where: { type },
  //   });
  //   return { data: res };
  // }

  async update(id: number, updateAttributeDto: UpdateAttributeDto) {
    const res = await this.prisma.attribute.update({
      where: { id },
      data: updateAttributeDto,
    });
    return { data: res };
  }

  async softDelete(id: number) {
    const entity = await this.prisma.attribute.findUnique({
      where: { id, isDeleted: false },
    });

    if (!entity) {
      throw new NotFoundException('Đối tượng không tồn tại!!');
    }
    return await this.prisma.attribute.update({
      where: { id },
      data: { isDeleted: true },
    });
  }

  async restore(id: number) {
    const entity = await this.prisma.attribute.findUnique({
      where: { id, isDeleted: true },
    });

    if (!entity) {
      throw new NotFoundException('Attribute not found');
    }
    await this.prisma.attribute.update({
      where: { id },
      data: { isDeleted: false },
    });
    return {
      message: 'Attribute restored successfully',
    };
  }

  async forceDelete(id: number) {
    await this.prisma.attribute.delete({
      where: { id },
    });
    return {
      message: 'Attribute deleted successfully',
    };
  }
}
