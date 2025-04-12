import { BadRequestException, Injectable } from '@nestjs/common';
import { JsonObject } from '@prisma/client/runtime/library';
import { PrismaService } from '../prisma/prisma.service';
import { OrderStatus } from '@prisma/client';

import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { typeToStatusMap } from 'src/enums/order.enum';
import { CartsService } from '../carts/carts.service';

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private readonly cartService: CartsService,
  ) {}

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

    let orderItems = [];

    const order = await this.prisma.$transaction(async (tx) => {
      const skus = await tx.productSKU.findMany({
        where: {
          id: { in: items.map((item) => item.skuId) },
        },
      });

      let totalPrice = 0;
      orderItems = items.map((item) => {
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
      const orderCode = `GDN-${formattedDate}-${paddedId}`;
      return tx.order.update({
        where: { id: tempOrder.id },
        data: { orderCode },
      });
    });

    if (userId) {
      const cart = await this.prisma.cart.findUnique({
        where: { userId: userId },
      });
      if (cart) {
        for (const item of orderItems) {
          const cartItem = await this.prisma.cartItem.findFirst({
            where: {
              cartId: cart.id,
              skuId: item.skuId,
            },
          });
          if (cartItem) {
            await this.cartService.removeCartItem(cartItem?.id);
          }
        }
      }
    }
    return order;
  }

  async findAll() {
    const orders = await this.prisma.order.findMany();
    return { data: orders };
  }

  async findOne(orderCode: string) {
    const orders = await this.prisma.order.findUnique({
      where: {
        orderCode,
      },
      include: {
        orderItems: {
          select: {
            product: {
              select: {
                name: true,
                images: true,
              },
            },
            sku: {
              select: {
                price: true,
                imageUrl: true,
                productSkuAttributes: {
                  select: {
                    attribute: {
                      select: {
                        type: true,
                        value: true,
                      },
                    },
                  },
                },
              },
            },
            quantity: true,
          },
        },
        paymentMethod: true,
      },
    });
    return { data: orders };
  }

  async getUserPurchases(userId: number, type: number) {
    const status = typeToStatusMap[type];
    const orders = await this.prisma.order.findMany({
      where: { userId, status: status },
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
