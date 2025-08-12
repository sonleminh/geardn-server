import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

import * as dayjs from 'dayjs';
import { ReturnStatus } from 'src/common/enums/return-status.enum';

import { ImportLogService } from '../import-log/import-log.service';
import { FindOrdersReturnRequestDto } from './dto/find-orders-return-request.dto';

@Injectable()
export class OrderReturnRequestService {
  constructor(
    private prisma: PrismaService,
    private readonly importLogService: ImportLogService,
  ) {}

  async findAll(query: FindOrdersReturnRequestDto) {
    const {
      productIds,
      fromDate,
      toDate,
      search,
      page = 1,
      limit = 10,
      sort = 'desc',
    } = query || {};
    const skip = (page - 1) * limit;

    // Build where clause
    // const where: any = {
    //   AND: [
    //     ...(productIds?.length
    //       ? [
    //           {
    //             orderItems: {
    //               some: {
    //                 productId: { in: productIds },
    //               },
    //             },
    //           },
    //         ]
    //       : []),
    //     ...(fromDate && toDate
    //       ? [
    //           {
    //             createdAt: createDateRangeFilter(fromDate, toDate),
    //           },
    //         ]
    //       : []),
    //     ...(search
    //       ? [
    //           {
    //             OR: [
    //               { orderCode: createSearchFilter(search) },
    //               { fullName: createSearchFilter(search) },
    //               { phoneNumber: createSearchFilter(search) },
    //               { email: createSearchFilter(search) },
    //             ],
    //           },
    //         ]
    //       : []),
    //   ],
    // };

    const [orderReturnRequests, total] = await Promise.all([
      this.prisma.orderReturnRequest.findMany({
        // where,
        skip,
        take: limit,
        orderBy: { createdAt: sort },
        include: {
          order: {
            select: {
              fullName: true,
              phoneNumber: true,
              email: true,
              totalPrice: true,
              orderItems: true,
            },
          },
          orderReturnItems: true,
        },
      }),
      this.prisma.orderReturnRequest.count({}),
    ]);

    return {
      data: orderReturnRequests,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      message: 'Order return request list retrieved successfully',
    };
  }

  async findOne(id: number) {
    const res = await this.prisma.orderReturnRequest.findUnique({
      where: {
        id,
      },
      include: {
        order: {
          select: {
            fullName: true,
            phoneNumber: true,
            email: true,
            totalPrice: true,
            orderItems: true,
            paymentMethod: true,
          },
        },
      },
    });
    return { data: res };
  }

  async updateStatus(
    returnId: number,
    status: { oldStatus: ReturnStatus; newStatus: ReturnStatus },
    // userId: number,
    // note: string,
  ) {
    await this.prisma.$transaction(async (tx) => {
      await tx.orderReturnRequest.update({
        where: { id: returnId },
        data: {
          status: status.newStatus,
        },
      });
    });

    return { message: 'Return request status updated successfully' };
  }

  async completeReturnRequest(
    returnId: number,
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
        const returnRequest = await tx.orderReturnRequest.findUnique({
          where: { id: returnId },
          include: {
            orderReturnItems: true,
          },
        });

        if (!returnRequest) {
          throw new BadRequestException('Return request not found');
        }

        const order = await tx.order.findUnique({
          where: { id: returnRequest.orderId },
          include: {
            orderItems: true,
          },
        });

        if (!order) {
          throw new BadRequestException('Order not found');
        }

        // Group order items by warehouse for optimized import logs
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

          // Group by warehouse for import log optimization
          if (!warehouseGroups.has(mapping.warehouseId)) {
            warehouseGroups.set(mapping.warehouseId, []);
          }

          warehouseGroups.get(mapping.warehouseId)!.push({
            skuId: mapping.skuId,
            quantity: orderItem.quantity,
            unitCost: orderItem.unitCost,
          });
        }

        // Create one import log per warehouse (optimized approach)
        for (const [warehouseId, items] of warehouseGroups) {
          // Create import log within transaction
          const today = new Date()
            .toISOString()
            .split('T')[0]
            .replace(/-/g, '');
          const countToday = await tx.importLog.count({
            where: {
              createdAt: {
                gte: new Date(new Date().setHours(0, 0, 0, 0)),
                lte: new Date(new Date().setHours(23, 59, 59, 999)),
              },
            },
          });

          const referenceCode = `IMP-${today}-${String(countToday + 1).padStart(4, '0')}`;

          const importLog = await tx.importLog.create({
            data: {
              warehouseId: warehouseId,
              createdBy: userId,
              type: 'RETURN',
              orderId: returnRequest.orderId,
              note: `Hoàn trả đơn hàng ${order.orderCode}`,
              referenceCode,
              importDate: new Date(),
            },
          });

          // Create import log items
          const importLogItems = items.map((item) => ({
            importLogId: importLog.id,
            skuId: item.skuId,
            quantity: item.quantity,
            unitCost: item.unitCost,
          }));

          await tx.importLogItem.createMany({
            data: importLogItems,
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
                  increment: item.quantity,
                },
              },
            });
          }
        }

        // Update order status
        await tx.orderReturnRequest.update({
          where: { id: returnId },
          data: { status: 'COMPLETED' },
        });
      },
      {
        timeout: 20000, // 20 seconds timeout for the entire operation
      },
    );

    return { message: 'Shipment confirmed successfully' };
  }
}
