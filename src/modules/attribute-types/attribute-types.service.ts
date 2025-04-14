import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAttributeTypeDto } from './dto/create-attribute-type.dto';
import { UpdateAttributeTypeDto } from './dto/update-attribute-type.dto';

@Injectable()
export class AttributeTypesService {
  constructor(private prisma: PrismaService) {}

  async create(createAttributeTypeDto: CreateAttributeTypeDto) {
    return this.prisma.attributeType.create({
      data: createAttributeTypeDto,
    });
  }

  async findAll() {
    const [res, total] = await Promise.all([
      this.prisma.attributeType.findMany(),
      this.prisma.attributeType.count(),
    ]);
    return {
      data: res,
      total,
    };
  }

  async findOne(id: number) {
    const res = await this.prisma.attributeType.findUnique({
      where: { id },
    });
    return { data: res };
  }

  // async findByType(type: string) {
  //   const res = await this.prisma.productAttribute.findMany({
  //     where: { type },
  //   });
  //   return { data: res };
  // }

  async update(id: number, updateAttributeTypeDto: UpdateAttributeTypeDto) {
    const res = await this.prisma.attributeType.update({
      where: { id },
      data: updateAttributeTypeDto,
    });
    return { data: res };
  }

  remove(id: number) {
    return this.prisma.attributeType.delete({ where: { id } });
  }
}
