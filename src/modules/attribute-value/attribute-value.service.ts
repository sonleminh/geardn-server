import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAttributeValueDto } from './dto/create-attribute-value.dto';
import { UpdateAttributeValueDto } from './dto/update-attribute-value.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AttributeValueService {
  constructor(private prisma: PrismaService) {}

  async create(createAttributeValueDto: CreateAttributeValueDto) {
    return this.prisma.attributeValue.create({
      data: createAttributeValueDto,
    });
  }

  async findAll() {
    const [res, total] = await Promise.all([
      this.prisma.attributeValue.findMany({
        where: { isDeleted: false },
        include: {
          attribute: true,
        },
      }),
      this.prisma.attributeValue.count(),
    ]);
    return {
      data: res,
      total,
    };
  }

  async adminFindAll() {
    const [res, total] = await Promise.all([
      this.prisma.attributeValue.findMany({
        include: {
          attribute: true,
        },
      }),
      this.prisma.attributeValue.count(),
    ]);
    return {
      data: res,
      total,
    };
  }

  async findOne(id: number) {
    const res = await this.prisma.attributeValue.findUnique({
      where: { id },
    });
    return { data: res };
  }

  async findByAttributeId(attributeId: number) {
    const res = await this.prisma.attributeValue.findMany({
      where: { attributeId },
    });
    return { data: res };
  }

  async update(id: number, updateAttributeValueDto: UpdateAttributeValueDto) {
    const res = await this.prisma.attributeValue.update({
      where: { id },
      data: updateAttributeValueDto,
    });
    return { data: res };
  }

  async softDelete(id: number) {
    const entity = await this.prisma.attributeValue.findUnique({
      where: { id, isDeleted: false },
    });

    if (!entity) {
      throw new NotFoundException('Đối tượng không tồn tại!!');
    }
    return await this.prisma.attributeValue.update({
      where: { id },
      data: { isDeleted: true },
    });
  }

  async restore(id: number) {
    const entity = await this.prisma.attributeValue.findUnique({
      where: { id, isDeleted: true },
    });

    if (!entity) {
      throw new NotFoundException('AttributeValue not found');
    }
    await this.prisma.attributeValue.update({
      where: { id },
      data: { isDeleted: false },
    });
    return {
      message: 'AttributeValue restored successfully',
    };
  }

  async forceDelete(id: number) {
    await this.prisma.attributeValue.delete({
      where: { id },
    });
    return {
      message: 'AttributeValue deleted successfully',
    };
  }
}
