import { BadRequestException, Injectable } from '@nestjs/common';
import { JsonObject } from '@prisma/client/runtime/library';
import { PrismaService } from '../prisma/prisma.service';
import { OrderReasonCode } from 'src/common/enums/order-reason-code';

import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { CartService } from '../cart/cart.service';
import { ExportLogService } from '../export-log/export-log.service';
import {
  createDateRangeFilter,
  createSearchFilter,
} from '../../common/helpers/query.helper';
import { FindOrderStatusHistoryDto } from './dto/find-order-status-history.dto';
import { FindOrdersDto } from './dto/find-orders.dto';
import * as dayjs from 'dayjs';
import { OrderStatus, typeToStatusMap } from 'src/common/enums/order-status.enum';
import { Prisma, ReturnStatus } from '@prisma/client';

const ALLOWED_STATUS_TRANSITIONS: Readonly<
  Record<OrderStatus, readonly OrderStatus[]>
> = {
  [OrderStatus.PENDING]: [OrderStatus.PROCESSING, OrderStatus.CANCELED],
  [OrderStatus.PROCESSING]: [
    OrderStatus.SHIPPED,
    OrderStatus.DELIVERED,
    OrderStatus.CANCELED,
  ],
  [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED, OrderStatus.DELIVERY_FAILED],
  [OrderStatus.DELIVERED]: [],
  [OrderStatus.DELIVERY_FAILED]: [OrderStatus.CANCELED],
  [OrderStatus.CANCELED]: [],
} as const;

type CountSumByStatus = {
  status: OrderStatus;
  _count: { _all: number };
  _sum: { grandTotal: number | null }; // đổi field nếu bạn dùng tên khác, ví dụ totalAmount
};

type Row = { status: OrderStatus; count: bigint; sum: number | null };

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
      completedAt,
    } = createOrderDto;

    let orderItemsData = [];

    const order = await this.prisma.$transaction(async (tx) => {
      const skus = await tx.productSKU.findMany({
        where: {
          id: { in: orderItems.map((item) => item.skuId) },
        },
        include: {
          product: true,
          productSkuAttributes: {
            select: {
              id: true,
              attributeValue: {
                select: {
                  value: true,
                  attribute: {
                    select: {
                      id: true,
                      name: true,
                      label: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      let totalPrice = 0;
      orderItemsData = orderItems.map((item) => {
        const sku = skus.find((s) => s.id === item.skuId);
        if (!sku) throw new BadRequestException(`SKU ${item.skuId} not found`);
        totalPrice += Number(sku.sellingPrice) * item.quantity;

        return {
          productId: sku.productId,
          skuId: sku.id,
          quantity: item.quantity,
          sellingPrice: sku.sellingPrice,
          imageUrl: sku.imageUrl ?? sku.product.images[0],
          productName: sku.product.name,
          productSlug: sku.product.slug,
          skuCode: sku.sku,
          skuAttributes: sku.productSkuAttributes.map(
            (productSkuAttribute) => ({
              attribute: productSkuAttribute.attributeValue.attribute.label,
              value: productSkuAttribute.attributeValue.value,
            }),
          ),
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
          shipment: shipment as JsonObject,
          flag: flag as JsonObject,
          orderItems: {
            create: orderItemsData,
          },
          completedAt,
        },
        include: {
          orderItems: true,
        },
      });

      const paddedId = String(tempOrder.id).padStart(6, '0');
      const orderCode = `GDN-${paddedId}`;

      await tx.outbox.create({
        data: {
          eventType: 'ORDER_CREATED',
          payload: {
            resourceId: tempOrder.id,
            resourceType: 'ORDER',
            orderCode,
            total: totalPrice,
            createdBy: userId,
          },
        },
      });

      return await tx.order.update({
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
    console.log('order', order);
    return { data: order };
  }

  async findAll(dto: FindOrdersDto) {
    const {
      productIds,
      statuses,
      fromDate,
      toDate,
      search,
      page = 1,
      limit = 10,
      sort = 'desc',
    } = dto || {};
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
                // createdAt: createDateRangeFilter(fromDate, toDate),
                createdAt: {
                  gte: dayjs(fromDate).startOf('day').toDate(),
                  lte: dayjs(toDate).endOf('day').toDate(),
                },
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

  async findOne(orderCode: string) {
    console.log('orderCode:', orderCode)
    const res = await this.prisma.order.findUnique({
      where: {
        orderCode,
      },
      include: {
        orderItems: {
          select: {
            productName: true,
            productId: true,
            productSlug: true,
            skuId: true,
            skuCode: true,
            sellingPrice: true,
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
                    unitCost: true,
                  },
                },
              },
            },
            skuCode: true,
            sellingPrice: true,
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

  async findOrderStatusHistory(query: FindOrderStatusHistoryDto) {
    const {
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
                order: {
                  orderCode: createSearchFilter(search),
                },
              },
            ]
          : []),
      ],
    };

    const [orders, total] = await Promise.all([
      this.prisma.orderStatusHistory.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: sort },
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
          order: {
            select: {
              id: true,
              orderCode: true,
              status: true,
              createdAt: true,
              updatedAt: true,
            },
          },
        },
      }),
      this.prisma.orderStatusHistory.count({ where }),
    ]);

    return {
      data: orders,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      message: 'Order status history retrieved successfully',
    };
  }

  async update(orderId: number, updateOrderDto: UpdateOrderDto) {
    const { orderItems, ...orderData } = updateOrderDto;

    const existingItems = await this.prisma.orderItem.findMany({
      where: { orderId },
    });

    const existingMap = new Map(
      existingItems.map((item) => [`${item.skuId}`, item]),
    );
    const newMap = new Map(orderItems.map((item) => [`${item.skuId}`, item]));

    await this.prisma.$transaction(async (tx) => {
      for (const [skuId, newItem] of newMap.entries()) {
        const existing = existingMap.get(skuId);
        const sku = await tx.productSKU.findUnique({
          where: { id: Number(skuId) },
          include: {
            product: true,
            productSkuAttributes: {
              select: {
                id: true,
                attributeValue: {
                  select: {
                    value: true,
                    attribute: {
                      select: {
                        id: true,
                        name: true,
                        label: true,
                      },
                    },
                  },
                },
              },
            },
          },
        });
        if (!existing) {
          // Add new order item
          await tx.orderItem.create({
            data: {
              orderId,
              productId: sku.productId,
              skuId: +skuId,
              quantity: newItem.quantity,
              sellingPrice: sku.sellingPrice,
              imageUrl: sku.imageUrl ?? sku.product.images[0],
              productName: sku.product.name,
              productSlug: sku.product.slug,
              skuCode: sku.sku,
              skuAttributes: sku.productSkuAttributes.map(
                (productSkuAttribute) => ({
                  attribute: productSkuAttribute.attributeValue.attribute.label,
                  value: productSkuAttribute.attributeValue.value,
                }),
              ),
            },
          });
        } else {
          // So sánh nếu quantity hoặc price thay đổi thì update
          if (
            newItem.quantity !== existing.quantity ||
            Number(sku.sellingPrice) !== Number(existing.sellingPrice)
          ) {
            await tx.orderItem.update({
              where: { id: existing.id },
              data: {
                quantity: newItem.quantity,
                sellingPrice: sku.sellingPrice,
                imageUrl: sku.imageUrl ?? sku.product.images[0],
                productName: sku.product.name,
                productSlug: sku.product.slug,
                skuCode: sku.sku,
                skuAttributes: sku.productSkuAttributes.map(
                  (productSkuAttribute) => ({
                    attribute:
                      productSkuAttribute.attributeValue.attribute.label,
                    value: productSkuAttribute.attributeValue.value,
                  }),
                ),
              },
            });
          }
        }
      }

      for (const [skuId, existing] of existingMap.entries()) {
        if (!newMap.has(skuId)) {
          // Xoá những cái không còn
          await tx.orderItem.delete({
            where: { id: existing.id },
          });
        }
      }

      // Update các field khác của đơn hàng
      await tx.order.update({
        where: { id: orderId },
        data: { ...orderData },
      });
    });
  }

  async updateStatus(
    orderId: number,
    status: { oldStatus: OrderStatus; newStatus: OrderStatus },
    userId: number,
    note: string,
  ) {
    await this.prisma.$transaction(async (tx) => {
      const existingOrder = await tx.order.findUnique({
        where: { id: orderId },
        select: { status: true, completedAt: true },
      });

      if (!existingOrder) {
        throw new BadRequestException('Order not found');
      }

      if (existingOrder.status !== status.oldStatus) {
        throw new BadRequestException(
          'Order status is outdated. Please refresh and try again.',
        );
      }

      if (status.newStatus === existingOrder.status) {
        throw new BadRequestException(
          'New status must be different from current status',
        );
      }

      const allowedNextStatuses =
        ALLOWED_STATUS_TRANSITIONS[existingOrder.status];
      if (!allowedNextStatuses.includes(status.newStatus)) {
        throw new BadRequestException('Invalid status transition');
      }

      if (
        status.newStatus === OrderStatus.DELIVERED &&
        !existingOrder.completedAt
      ) {
        await tx.order.update({
          where: { id: orderId },
          data: { completedAt: new Date() },
        });
      }
      await tx.order.update({
        where: { id: orderId },
        data: {
          status: status.newStatus,
        },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId,
          oldStatus: status.oldStatus,
          newStatus: status.newStatus,
          changedBy: userId,
          note,
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

        if (order?.status !== 'PENDING') {
          throw new BadRequestException('Invalid status transition');
        }

        if (!order) {
          throw new BadRequestException('Order not found');
        }

        // Group order items by warehouse for optimized export logs
        const warehouseGroups = new Map<
          number,
          Array<{
            skuId: number;
            quantity: number;
            unitCost: any;
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
              unitCost: stock.unitCost,
            },
          });

          // Group by warehouse for export log optimization
          if (!warehouseGroups.has(mapping.warehouseId)) {
            warehouseGroups.set(mapping.warehouseId, []);
          }

          warehouseGroups.get(mapping.warehouseId)!.push({
            skuId: mapping.skuId,
            quantity: orderItem.quantity,
            unitCost: stock.unitCost,
          });
        }

        // Create one export log per warehouse (optimized approach)
        for (const [warehouseId, items] of warehouseGroups) {
          // Create export log within transaction
          const today = new Date();
          const localToday = today
            .toLocaleDateString('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' }) // YYYY-MM-DD
            .replace(/-/g, '');
          const countToday = await tx.exportLog.count({
            where: {
              createdAt: {
                gte: new Date(new Date().setHours(0, 0, 0, 0)),
                lte: new Date(new Date().setHours(23, 59, 59, 999)),
              },
            },
          });
          const referenceCode = `EXP-${localToday}-${String(countToday + 1).padStart(4, '0')}`;

          const exportLog = await tx.exportLog.create({
            data: {
              warehouseId: warehouseId,
              createdBy: userId,
              type: 'CUSTOMER_ORDER',
              orderId: orderId,
              note: `Xác nhận đơn hàng ${order.orderCode}`,
              referenceCode,
              exportDate: new Date(),
            },
          });

          // Create export log items
          const exportLogItems = items.map((item) => ({
            exportLogId: exportLog.id,
            skuId: item.skuId,
            quantity: item.quantity,
            unitCost: item.unitCost,
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
          data: { status: 'PROCESSING', confirmedAt: new Date() },
        });

        await tx.orderStatusHistory.create({
          data: {
            orderId,
            oldStatus: 'PENDING',
            newStatus: 'PROCESSING',
            changedBy: userId,
            note: 'Xác nhận đơn hàng',
          },
        });
      },
      {
        timeout: 20000, // 20 seconds timeout for the entire operation
      },
    );

    return { message: 'Shipment confirmed successfully' };
  }

  async cancelOrder(
    orderId: number,
    userId: number,
    oldStatus: OrderStatus,
    cancelReasonCode: OrderReasonCode,
    cancelReason: string,
  ) {
    await this.prisma.$transaction(async (tx) => {
      const order = await tx.order.update({
        where: { id: orderId },
        data: { status: 'CANCELED', cancelReasonCode, cancelReason },
        include: {
          orderItems: {
            select: {
              id: true,
              quantity: true,
            },
          },
        },
      });

      const orderReturnItems = order.orderItems.map((item) => ({
        orderItemId: item.id,
        quantity: item.quantity,
      }));

      await tx.orderStatusHistory.create({
        data: {
          orderId,
          oldStatus: oldStatus,
          newStatus: 'CANCELED',
          changedBy: userId,
          note: cancelReason,
        },
      });

      if (oldStatus !== 'PENDING' && oldStatus !== 'DELIVERY_FAILED') {
        const orderReturnRequest = await tx.orderReturnRequest.create({
          data: {
            orderId,
            type: 'CANCEL',
            status: 'AWAITING_APPROVAL',
            reasonCode: cancelReasonCode,
            reasonNote: cancelReason,
            orderReturnItems: {
              create: orderReturnItems,
            },
            createdById: userId,
          },
        });
        await tx.outbox.create({
          data: {
            eventType: 'RETURN_REQUEST_CREATED',
            payload: {
              resourceId: orderReturnRequest.id,
              resourceType: 'RETURN_REQUEST',
              orderCode: order.orderCode,
              createdBy: userId,
            },
          },
        });
      }
    });
  }

  async updateDeliveryFailed(
    orderId: number,
    userId: number,
    oldStatus: OrderStatus,
    reasonCode: OrderReasonCode,
    reasonNote: string,
  ) {
    await this.prisma.$transaction(async (tx) => {
      const order = await tx.order.update({
        where: { id: orderId },
        data: { status: 'DELIVERY_FAILED' },
        include: {
          orderItems: {
            select: {
              id: true,
              quantity: true,
            },
          },
        },
      });

      const orderReturnItems = order.orderItems.map((item) => ({
        orderItemId: item.id,
        quantity: item.quantity,
      }));

      await tx.orderStatusHistory.create({
        data: {
          orderId,
          oldStatus: oldStatus,
          newStatus: 'DELIVERY_FAILED',
          changedBy: userId,
          note: reasonNote,
        },
      });

      await tx.orderReturnRequest.create({
        data: {
          orderId,
          type: 'DELIVERY_FAIL',
          status: 'AWAITING_APPROVAL',
          reasonCode: reasonCode,
          reasonNote: reasonNote,
          orderReturnItems: {
            create: orderReturnItems,
          },
          createdById: userId,
        },
      });
    });
  }

  async getUserPurchases(userId: number, type: number) {
  const status = typeToStatusMap[type];

  const [orders, grouped] = await this.prisma.$transaction([
    this.prisma.order.findMany({
      where: { userId, status },
      include: { orderItems: { include: { product: true, sku: true } } },
      orderBy: { createdAt: 'desc' },
    }),
    this.prisma.$queryRaw<Row[]>`
      SELECT "status",
             COUNT(*)::bigint AS count
      FROM "Order"
      WHERE "userId" = ${userId}
      GROUP BY "status"
    `,
  ]);

  const countsByStatus = Object.values(OrderStatus).reduce((acc, s) => {
    const r = grouped.find(g => g.status === s);
    acc[s] = r ? Number(r.count) : 0;
    return acc;
  }, {} as Record<OrderStatus, number>);

  const overallCount = grouped.reduce((n, r) => n + Number(r.count), 0);
  const overallSum = grouped.reduce((n, r) => n + Number(r.sum ?? 0), 0);

  return { data: orders, meta: { countsByStatus, overall: { count: overallCount, sum: overallSum } } };
}
}
