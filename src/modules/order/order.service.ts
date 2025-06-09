import { BadRequestException, Injectable } from '@nestjs/common';
import { JsonObject } from '@prisma/client/runtime/library';
import { PrismaService } from '../prisma/prisma.service';
import { OrderStatus } from '@prisma/client';

import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { typeToStatusMap } from 'src/common/enums/order-status.enum';
import { CartService } from '../cart/cart.service';

@Injectable()
export class OrderService {
  constructor(
    private prisma: PrismaService,
    private readonly cartService: CartService,
  ) {}

  async create(createOrderDto: CreateOrderDto) {
    const {
      userId,
      orderItems,
      paymentMethodId,
      fullName,
      phoneNumber,
      email,
      note,
      shipment,
      flag,
    } = createOrderDto;

    let orderItemsData = [];

    const order = await this.prisma.$transaction(async (tx) => {
      const skus = await tx.productSKU.findMany({
        where: {
          id: { in: orderItems.map((item) => item.skuId) },
        },
      });

      let totalPrice = 0;
      orderItemsData = orderItems.map((item) => {
        const sku = skus.find((s) => s.id === item.skuId);
        if (!sku) throw new BadRequestException(`SKU ${item.skuId} not found`);
        // if (sku.quantity < item.quantity) {
        //   throw new BadRequestException(`SKU ${item.skuId} out of stock`);
        // }
        totalPrice += Number(sku.price) * item.quantity;
        return {
          productId: item.productId,
          skuId: item.skuId,
          quantity: item.quantity,
          price: item.price,
          imageUrl: item.imageUrl,
          productName: item.productName,
          productSlug: item.productSlug,
          skuCode: item.skuCode,
          skuAttributes: item.skuAttributes,
        };
      });

      // for (const item of items) {
      //   await tx.productSKU.update({
      //     where: { id: item.skuId },
      //     data: {
      //       quantity: {
      //         decrement: item.quantity,
      //       },
      //     },
      //   });
      // }

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
    const orders = await this.prisma.order.findMany({
      include: {
        orderItems: true,
      },
    });
    return { data: orders };
  }

  async findOne(id: number) {
    const res = await this.prisma.order.findUnique({
      where: {
        id,
      },
      include: {
        orderItems: {
          select: {
            productName: true,
            productId: true,
            skuId: true,
            price: true,
            quantity: true,
            imageUrl: true,
            skuAttributes: true,
          },
        },
        paymentMethod: true,
      },
    });
    return { data: res };
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
    const { orderItems, ...orderData } = updateOrderDto;

    return this.prisma.$transaction(async (tx) => {
      // First, delete existing order items
      await tx.orderItem.deleteMany({
        where: { orderId },
      });

      // Then update the order with new data and create new order items
      return tx.order.update({
        where: { id: orderId },
        data: {
          ...orderData,
          orderItems: {
            create: orderItems.map(item => ({
              productId: item.productId,
              skuId: item.skuId,
              quantity: item.quantity,
              price: item.price,
              imageUrl: item.imageUrl,
              productName: item.productName,
              productSlug: item.productSlug,
              skuCode: item.skuCode,
              skuAttributes: item.skuAttributes,
            })),
          },
        },
        include: {
          orderItems: true,
          paymentMethod: true,
          user: true,
        },
      });
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
