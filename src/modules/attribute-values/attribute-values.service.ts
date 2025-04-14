import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateAttributeValueDto } from './dto/create-attribute-values.dto';
import { UpdateAttributeValueDto } from './dto/update-attribute-values.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AttributeValuesService {
  constructor(private prisma: PrismaService) {}

  async create(createAttributeValueDto: CreateAttributeValueDto) {
    return this.prisma.attributeValue.create({
      data: createAttributeValueDto,
    });
  }

  async findAll() {
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

  remove(id: number) {
    return this.prisma.attributeValue.delete({ where: { id } });
  }
}
