import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { PrismaService } from '../prisma/prisma.service';
import { OrderStatus } from '@prisma/client';
import { JsonObject } from '@prisma/client/runtime/library';

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
      email,
      note,
      shipment,
      flag,
    } = createOrderDto;

    return this.prisma.$transaction(async (tx) => {
      const skus = await tx.productSKU.findMany({
        where: {
          id: { in: items.map((item) => item.skuId) },
        },
      });

      let totalPrice = 0;
      const orderItems = items.map((item) => {
        const sku = skus.find((s) => s.id === item.skuId);
        if (!sku) throw new BadRequestException(`SKU ${item.skuId} not found`);
        if (sku.quantity < item.quantity) {
          throw new BadRequestException(`SKU ${item.skuId} out of stock`);
        }
        totalPrice += Number(sku.price) * item.quantity;
        return {
          productId: sku.productId,
          skuId: sku.id,
          quantity: item.quantity,
          price: sku.price,
        };
      });

      for (const item of items) {
        await tx.productSKU.update({
          where: { id: item.skuId },
          data: {
            quantity: {
              decrement: item.quantity,
            },
          },
        });
      }

      // 4. Tạo order
      const tempOrder = await tx.order.create({
        data: {
          userId,
          orderCode: 'TEMP' + Date.now(),
          totalPrice,
          paymentMethodId,
          fullName,
          phoneNumber,
          email,
          note,
          status: 'PENDING',
          shipment: shipment as JsonObject,
          flag: flag as JsonObject,
          orderItems: {
            create: orderItems,
          },
        },
        include: {
          orderItems: true,
        },
      });

      const formattedDate = new Date()
        .toISOString()
        .split('T')[0]
        .replace(/-/g, '');
      const paddedId = String(tempOrder.id).padStart(6, '0');
      const orderCode = `ORD-${formattedDate}-${paddedId}`;
      const order = await tx.order.update({
        where: { id: tempOrder.id },
        data: { orderCode },
      });

      return order;
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
