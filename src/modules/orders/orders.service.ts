import { Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { PrismaService } from '../prisma/prisma.service';
import { OrderStatus } from '@prisma/client';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async create(createOrderDto: CreateOrderDto) {
    const {
      userId,
      items,
      paymentMethodId,
      fullName,
      phoneNumber,
      note,
      shipment,
    } = createOrderDto;

    const skus = await this.prisma.productSKU.findMany({
      where: {
        id: { in: items.map((item) => item.skuId) },
      },
    });

    let totalPrice = 0;
    const orderItems = items.map((item) => {
      const sku = skus.find((s) => s.id === item.skuId);
      if (!sku) throw new Error('SKU not found');
      totalPrice += Number(sku.price) * item.quantity;
      return {
        productId: sku.productId,
        skuId: sku.id,
        quantity: item.quantity,
        price: sku.price,
      };
    });

    return this.prisma.order.create({
      data: {
        userId,
        totalPrice,
        paymentMethodId,
        fullName,
        phoneNumber,
        note,
        status: 'PENDING',
        shipment,
        orderItems: { create: orderItems },
      },
      include: { orderItems: true },
    });
  }

  async findAll() {
    const orders = await this.prisma.order.findMany();
    return { data: orders };
  }

  async getOrdersByUser(userId: number) {
    const orders = await this.prisma.order.findMany({
      where: { userId },
      include: { orderItems: { include: { product: true, sku: true } } },
    });
    return { data: orders };
  }

  async update(orderId: number, updateOrderDto: UpdateOrderDto) {
    return this.prisma.order.update({
      where: { id: orderId },
      data: updateOrderDto,
    });
  }

  async updateStatus(orderId: number, status: { status: OrderStatus }) {
    return this.prisma.order.update({
      where: { id: orderId },
      data: { status: status.status },
    });
  }

  // findAll() {
  //   return `This action returns all orders`;
  // }

  // findOne(id: number) {
  //   return `This action returns a #${id} order`;
  // }

  // update(id: number, updateOrderDto: UpdateOrderDto) {
  //   return `This action updates a #${id} order`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} order`;
  // }
}
