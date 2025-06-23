import { BadRequestException, Injectable } from '@nestjs/common';
import { JsonObject } from '@prisma/client/runtime/library';
import { PrismaService } from '../prisma/prisma.service';
import { OrderStatus } from '@prisma/client';

import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { typeToStatusMap } from 'src/common/enums/order-status.enum';
import { CartService } from '../cart/cart.service';
import { ExportLogService } from '../export-log/export-log.service';
import {
  createDateRangeFilter,
  createSearchFilter,
} from '../../common/helpers/query.helper';
import { FindOrdersDto } from './dto/find-orders.dto';

@Injectable()
export class OrderService {
  constructor(
    private prisma: PrismaService,
    private readonly cartService: CartService,
    private readonly exportLogService: ExportLogService,
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
            create: orderItemsData,
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

  async findAll(query: FindOrdersDto) {
    const {
      productIds,
      statuses,
      fromDate,
      toDate,
      search,
      page = 1,
      limit = 10,
      sort = 'desc',
    } = query || {};
    const skip = (page - 1) * limit;


    // Build where clause
    const where: any = {
      AND: [
        ...(productIds?.length
          ? [
              {
                orderItems: {
                  some: {
                    productId: { in: productIds },
                  },
                },
              },
            ]
          : []),
        ...(statuses?.length ? [{ status: { in: statuses } }] : []),
        ...(fromDate && toDate
          ? [
              {
                createdAt: createDateRangeFilter(fromDate, toDate),
              },
            ]
          : []),
        ...(search
          ? [
              {
                OR: [
                  { orderCode: createSearchFilter(search) },
                  { fullName: createSearchFilter(search) },
                  { phoneNumber: createSearchFilter(search) },
                  { email: createSearchFilter(search) },
                ],
              },
            ]
          : []),
      ],
    };

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: sort },
        include: { orderItems: true },
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      data: orders,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      message: 'Order list retrieved successfully',
    };
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
            productSlug: true,
            skuId: true,
            skuCode: true,
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

  async adminFindOne(id: number) {
    const res = await this.prisma.order.findUnique({
      where: {
        id,
      },
      include: {
        orderItems: {
          select: {
            productName: true,
            productId: true,
            productSlug: true,
            skuId: true,
            sku: {
              select: {
                stocks: {
                  select: {
                    quantity: true,
                    warehouseId: true,
                    costPrice: true,
                  },
                },
              },
            },
            skuCode: true,
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
            create: orderItems.map((item) => ({
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

  async updateStatus(
    orderId: number,
    status: { oldStatus: OrderStatus; newStatus: OrderStatus },
    userId: number,
  ) {
    await this.prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: orderId },
        data: { status: status.newStatus },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId,
          oldStatus: status.oldStatus,
          newStatus: status.newStatus,
          changedBy: userId,
        },
      });
    });

    return { message: 'Order status updated successfully' };
  }

  async confirmShipment(
    orderId: number,
    skuWarehouseMapping: { skuId: number; warehouseId: number }[],
    userId: number,
  ) {
    // Validate input parameters
    if (!skuWarehouseMapping) {
      throw new BadRequestException('skuWarehouseMapping is required');
    }

    if (!Array.isArray(skuWarehouseMapping)) {
      throw new BadRequestException('skuWarehouseMapping must be an array');
    }

    if (skuWarehouseMapping.length === 0) {
      throw new BadRequestException('skuWarehouseMapping cannot be empty');
    }

    if (!userId) {
      throw new BadRequestException('User ID is required');
    }

    // Single transaction to ensure data consistency
    await this.prisma.$transaction(
      async (tx) => {
        // First, get the order with all order items
        const order = await tx.order.findUnique({
          where: { id: orderId },
          include: {
            orderItems: true,
          },
        });

        if (!order) {
          throw new BadRequestException('Order not found');
        }

        // Group order items by warehouse for optimized export logs
        const warehouseGroups = new Map<
          number,
          Array<{
            skuId: number;
            quantity: number;
            costPrice: any;
          }>
        >();

        // Process each mapping and group by warehouse
        for (const mapping of skuWarehouseMapping) {
          // Validate mapping object
          if (!mapping || typeof mapping !== 'object') {
            throw new BadRequestException('Invalid mapping object');
          }

          if (!mapping.skuId || !mapping.warehouseId) {
            throw new BadRequestException(
              'Each mapping must have skuId and warehouseId',
            );
          }

          const stock = await tx.stock.findFirst({
            where: { skuId: mapping.skuId, warehouseId: mapping.warehouseId },
          });

          if (!stock || stock.quantity <= 0) {
            throw new BadRequestException(
              `Not enough stock for SKU ${mapping.skuId} in warehouse ${mapping.warehouseId}`,
            );
          }

          // Find the corresponding order item
          const orderItem = order.orderItems.find(
            (item) => item.skuId === mapping.skuId,
          );
          if (!orderItem) {
            throw new BadRequestException(
              `Order item not found for SKU ${mapping.skuId}`,
            );
          }

          // Update order item with warehouse and cost price
          await tx.orderItem.update({
            where: { id: orderItem.id },
            data: {
              warehouseId: mapping.warehouseId,
              costPrice: stock.costPrice,
            },
          });

          // Group by warehouse for export log optimization
          if (!warehouseGroups.has(mapping.warehouseId)) {
            warehouseGroups.set(mapping.warehouseId, []);
          }

          warehouseGroups.get(mapping.warehouseId)!.push({
            skuId: mapping.skuId,
            quantity: orderItem.quantity,
            costPrice: stock.costPrice,
          });
        }

        // Create one export log per warehouse (optimized approach)
        for (const [warehouseId, items] of warehouseGroups) {
          // Create export log within transaction
          const today = new Date()
            .toISOString()
            .split('T')[0]
            .replace(/-/g, '');
          const countToday = await tx.exportLog.count({
            where: {
              createdAt: {
                gte: new Date(new Date().setHours(0, 0, 0, 0)),
                lte: new Date(new Date().setHours(23, 59, 59, 999)),
              },
            },
          });

          const referenceCode = `EXP-${today}-${String(countToday + 1).padStart(4, '0')}`;

          const exportLog = await tx.exportLog.create({
            data: {
              warehouseId: warehouseId,
              createdBy: userId,
              type: 'CUSTOMER_ORDER',
              orderId: orderId,
              note: `Xác nhận đơn hàng ${order.orderCode}`,
              referenceCode,
            },
          });

          // Create export log items
          const exportLogItems = items.map((item) => ({
            exportLogId: exportLog.id,
            skuId: item.skuId,
            quantity: item.quantity,
            costPrice: item.costPrice,
          }));

          await tx.exportLogItem.createMany({
            data: exportLogItems,
          });

          // Update stock quantities
          for (const item of items) {
            await tx.stock.update({
              where: {
                skuId_warehouseId: {
                  skuId: item.skuId,
                  warehouseId,
                },
              },
              data: {
                quantity: {
                  decrement: item.quantity,
                },
              },
            });
          }
        }

        // Update order status
        await tx.order.update({
          where: { id: orderId },
          data: { status: 'PROCESSING' },
        });
      },
      {
        timeout: 20000, // 20 seconds timeout for the entire operation
      },
    );

    return { message: 'Shipment confirmed successfully' };
  }
}