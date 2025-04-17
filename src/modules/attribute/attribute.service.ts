import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAttributeDto } from './dto/create-attribute.dto';
import { UpdateAttributeDto } from './dto/update-attribute.dto';

@Injectable()
export class AttributeService {
  constructor(private prisma: PrismaService) {}

  async create(createAttributeDto: CreateAttributeDto) {
    return this.prisma.attribute.create({
      data: createAttributeDto,
    });
  }

  async findAll() {
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

  remove(id: number) {
    return this.prisma.attribute.delete({ where: { id } });
  }
}
