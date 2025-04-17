import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePaymentMethodDto } from './dto/create-payment-method.dto';
import { UpdatePaymentMethodDto } from './dto/update-payment-method.dto';

@Injectable()
export class PaymentMethodService {
  constructor(private prisma: PrismaService) {}

  async create(createPaymentMethodDto: CreatePaymentMethodDto) {
    return this.prisma.paymentMethod.create({ data: createPaymentMethodDto });
  }
  async findAll() {
    const [res, total] = await Promise.all([
      this.prisma.paymentMethod.findMany(),
      this.prisma.paymentMethod.count(),
    ]);
    return {
      data: res,
      total,
    };
  }
  async findOne(id: number) {
    const res = await this.prisma.paymentMethod.findUnique({ where: { id } });
    return { data: res };
  }

  async update(id: number, updatePaymentMethodDto: UpdatePaymentMethodDto) {
    const res = await this.prisma.category.update({
      where: { id },
      data: updatePaymentMethodDto,
    });
    return { data: res };
  }

  async delete(id: number) {
    return this.prisma.paymentMethod.delete({ where: { id } });
  }

  // async getPaymentMethodInitial() {
  //   try {
  //     const res = await this.paymentMethodModel
  //       .find({}, { name: 1, value: 1 })
  //       .lean()
  //       .exec();
  //     return res;
  //   } catch (error) {
  //     throw new BadRequestException(error);
  //   }
  // }
}
