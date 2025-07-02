import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OrderStatus } from '@prisma/client';

export interface RevenueStats {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  revenueByStatus: Record<OrderStatus, number>;
}

export interface ProfitStats {
  totalRevenue: number;
  totalCost: number;
  totalProfit: number;
  profitMargin: number;
  profitByStatus: Record<
    OrderStatus,
    { revenue: number; cost: number; profit: number }
  >;
}

export interface TimeRangeStats {
  startDate: Date;
  endDate: Date;
  revenue: number;
  cost: number;
  profit: number;
  orders: number;
  averageOrderValue: number;
}

export interface ProductStats {
  productId: number;
  productName: string;
  revenue: number;
  cost: number;
  profit: number;
  quantitySold: number;
  profitMargin: number;
}

@Injectable()
export class StatisticsService {
  constructor(private prisma: PrismaService) {}

  async getRevenueStats(
    fromDate?: string,
    toDate?: string,
    statuses?: OrderStatus[],
  ): Promise<RevenueStats> {
    const whereClause: any = {
      isDeleted: false,
      status: statuses && statuses.length > 0 ? { in: statuses } : 'DELIVERED',
    };

    if (fromDate && toDate) {
      whereClause.createdAt = {
        gte: new Date(fromDate),
        lte: new Date(toDate),
      };
    }

    const orders = await this.prisma.order.findMany({
      where: whereClause,
      select: {
        id: true,
        totalPrice: true,
        status: true,
      },
    });

    console.log('orders', orders);

    const totalRevenue = orders.reduce(
      (sum, order) => sum + Number(order.totalPrice),
      0,
    );
    const totalOrders = orders.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    const revenueByStatus = orders.reduce(
      (acc, order) => {
        const status = order.status as OrderStatus;
        acc[status] = (acc[status] || 0) + Number(order.totalPrice);
        return acc;
      },
      {} as Record<OrderStatus, number>,
    );

    return {
      totalRevenue,
      totalOrders,
      averageOrderValue,
      revenueByStatus,
    };
  }

  async getProfitStats(
    fromDate?: string,
    toDate?: string,
    statuses?: OrderStatus[],
  ): Promise<ProfitStats> {
    const whereClause: any = {
      isDeleted: false,
      status: statuses && statuses.length > 0 ? { in: statuses } : 'DELIVERED',
    };

    if (fromDate && toDate) {
      whereClause.createdAt = {
        gte: new Date(fromDate),
        lte: new Date(toDate),
      };
    }

    const orders = await this.prisma.order.findMany({
      where: whereClause,
      select: {
        id: true,
        totalPrice: true,
        status: true,
        orderItems: {
          select: {
            quantity: true,
            costPrice: true,
          },
        },
      },
    });

    let totalRevenue = 0;
    let totalCost = 0;
    const profitByStatus: Record<
      OrderStatus,
      { revenue: number; cost: number; profit: number }
    > = {} as any;

    for (const order of orders) {
      console.log('orderId', order?.id);

      const orderRevenue = Number(order.totalPrice);
      const orderCost = order.orderItems.reduce((sum, item) => {
        return sum + Number(item.costPrice || 0) * item.quantity;
      }, 0);

      console.log('orderCost', orderCost);

      totalRevenue += orderRevenue;
      totalCost += orderCost;

      const status = order.status as OrderStatus;
      if (!profitByStatus[status]) {
        profitByStatus[status] = { revenue: 0, cost: 0, profit: 0 };
      }
      profitByStatus[status].revenue += orderRevenue;
      profitByStatus[status].cost += orderCost;
      profitByStatus[status].profit += orderRevenue - orderCost;
    }

    const totalProfit = totalRevenue - totalCost;
    const profitMargin =
      totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

    return {
      totalRevenue,
      totalCost,
      totalProfit,
      profitMargin,
      profitByStatus,
    };
  }

  async getTimeRangeStats(
    fromDate: string,
    toDate: string,
    statuses?: OrderStatus[],
  ): Promise<TimeRangeStats> {
    const whereClause: any = {
      isDeleted: false,
      createdAt: {
        gte: new Date(fromDate),
        lte: new Date(toDate),
      },
      status: statuses && statuses.length > 0 ? { in: statuses } : 'DELIVERED',
    };

    const orders = await this.prisma.order.findMany({
      where: whereClause,
      select: {
        id: true,
        totalPrice: true,
        createdAt: true,
        orderItems: {
          select: {
            quantity: true,
            costPrice: true,
          },
        },
      },
    });

    const revenue = orders.reduce(
      (sum, order) => sum + Number(order.totalPrice),
      0,
    );
    const cost = orders.reduce((sum, order) => {
      return (
        sum +
        order.orderItems.reduce((itemSum, item) => {
          return itemSum + Number(item.costPrice || 0) * item.quantity;
        }, 0)
      );
    }, 0);
    const profit = revenue - cost;
    const ordersCount = orders.length;
    const averageOrderValue = ordersCount > 0 ? revenue / ordersCount : 0;

    return {
      startDate: new Date(fromDate),
      endDate: new Date(toDate),
      revenue,
      cost,
      profit,
      orders: ordersCount,
      averageOrderValue,
    };
  }

  async getProductStats(
    fromDate?: string,
    toDate?: string,
    statuses?: OrderStatus[],
  ): Promise<ProductStats[]> {
    const whereClause: any = {
      order: {
        isDeleted: false,
        status: statuses && statuses.length > 0 ? { in: statuses } : 'DELIVERED',
      },
    };

    if (fromDate && toDate) {
      whereClause.order.createdAt = {
        gte: new Date(fromDate),
        lte: new Date(toDate),
      };
    }

    const orderItems = await this.prisma.orderItem.findMany({
      where: whereClause,
      select: {
        productId: true,
        productName: true,
        quantity: true,
        price: true,
        costPrice: true,
      },
    });

    const productStatsMap = new Map<number, ProductStats>();

    for (const item of orderItems) {
      const productId = item.productId;
      const revenue = Number(item.price) * item.quantity;
      const cost = Number(item.costPrice || 0) * item.quantity;
      const profit = revenue - cost;

      if (!productStatsMap.has(productId)) {
        productStatsMap.set(productId, {
          productId,
          productName: item.productName,
          revenue: 0,
          cost: 0,
          profit: 0,
          quantitySold: 0,
          profitMargin: 0,
        });
      }

      const stats = productStatsMap.get(productId)!;
      stats.revenue += revenue;
      stats.cost += cost;
      stats.profit += profit;
      stats.quantitySold += item.quantity;
    }

    // Calculate profit margins
    for (const stats of productStatsMap.values()) {
      stats.profitMargin =
        stats.revenue > 0 ? (stats.profit / stats.revenue) * 100 : 0;
    }

    return Array.from(productStatsMap.values()).sort(
      (a, b) => b.profit - a.profit,
    );
  }

  async getDailyStats(
    fromDate: string,
    toDate: string,
    statuses?: OrderStatus[],
  ): Promise<TimeRangeStats[]> {
    const whereClause: any = {
      isDeleted: false,
      createdAt: {
        gte: new Date(fromDate),
        lte: new Date(toDate),
      },
      status: statuses && statuses.length > 0 ? { in: statuses } : 'DELIVERED',
    };

    const orders = await this.prisma.order.findMany({
      where: whereClause,
      select: {
        id: true,
        totalPrice: true,
        createdAt: true,
        orderItems: {
          select: {
            quantity: true,
            costPrice: true,
          },
        },
      },
    });

    const dailyStatsMap = new Map<string, TimeRangeStats>();

    for (const order of orders) {
      const dateKey = order.createdAt.toISOString().split('T')[0];
      const revenue = Number(order.totalPrice);
      const cost = order.orderItems.reduce((sum, item) => {
        return sum + Number(item.costPrice || 0) * item.quantity;
      }, 0);
      const profit = revenue - cost;

      if (!dailyStatsMap.has(dateKey)) {
        dailyStatsMap.set(dateKey, {
          startDate: new Date(dateKey),
          endDate: new Date(dateKey),
          revenue: 0,
          cost: 0,
          profit: 0,
          orders: 0,
          averageOrderValue: 0,
        });
      }

      const stats = dailyStatsMap.get(dateKey)!;
      stats.revenue += revenue;
      stats.cost += cost;
      stats.profit += profit;
      stats.orders += 1;
    }

    // Calculate average order values
    for (const stats of dailyStatsMap.values()) {
      stats.averageOrderValue =
        stats.orders > 0 ? stats.revenue / stats.orders : 0;
    }

    return Array.from(dailyStatsMap.values()).sort(
      (a, b) => a.startDate.getTime() - b.startDate.getTime(),
    );
  }

  async getMonthlyStats(
    year: number,
    statuses?: OrderStatus[],
  ): Promise<TimeRangeStats[]> {
    const whereClause: any = {
      isDeleted: false,
      createdAt: {
        gte: new Date(year, 0, 1),
        lte: new Date(year, 11, 31, 23, 59, 59, 999),
      },
      status: statuses && statuses.length > 0 ? { in: statuses } : 'DELIVERED',
    };

    const orders = await this.prisma.order.findMany({
      where: whereClause,
      select: {
        id: true,
        totalPrice: true,
        createdAt: true,
        orderItems: {
          select: {
            quantity: true,
            costPrice: true,
          },
        },
      },
    });

    const monthlyStatsMap = new Map<number, TimeRangeStats>();

    for (const order of orders) {
      const month = order.createdAt.getMonth();
      const revenue = Number(order.totalPrice);
      const cost = order.orderItems.reduce((sum, item) => {
        return sum + Number(item.costPrice || 0) * item.quantity;
      }, 0);
      const profit = revenue - cost;

      if (!monthlyStatsMap.has(month)) {
        const startDate = new Date(year, month, 1);
        const endDate = new Date(year, month + 1, 0, 23, 59, 59, 999);
        monthlyStatsMap.set(month, {
          startDate,
          endDate,
          revenue: 0,
          cost: 0,
          profit: 0,
          orders: 0,
          averageOrderValue: 0,
        });
      }

      const stats = monthlyStatsMap.get(month)!;
      stats.revenue += revenue;
      stats.cost += cost;
      stats.profit += profit;
      stats.orders += 1;
    }

    // Calculate average order values
    for (const stats of monthlyStatsMap.values()) {
      stats.averageOrderValue =
        stats.orders > 0 ? stats.revenue / stats.orders : 0;
    }

    return Array.from(monthlyStatsMap.values()).sort(
      (a, b) => a.startDate.getTime() - b.startDate.getTime(),
    );
  }

  /**
   * Get best seller products by quantity sold or revenue
   * @param fromDate
   * @param toDate
   * @param statuses
   * @param limit
   */
  async getBestSellerProducts(
    fromDate?: string,
    toDate?: string,
    statuses?: OrderStatus[],
    limit: number = 10,
  ) {
    const whereClause: any = {
      order: {
        isDeleted: false,
        status: statuses && statuses.length > 0 ? { in: statuses } : 'DELIVERED',
      },
    };
    if (fromDate && toDate) {
      whereClause.order.createdAt = {
        gte: new Date(fromDate),
        lte: new Date(toDate),
      };
    }
    const orderItems = await this.prisma.orderItem.findMany({
      where: whereClause,
      select: {
        productId: true,
        productName: true,
        quantity: true,
        price: true,
      },
    });
    const productMap = new Map<
      number,
      {
        productId: number;
        productName: string;
        quantitySold: number;
        revenue: number;
      }
    >();
    for (const item of orderItems) {
      if (!productMap.has(item.productId)) {
        productMap.set(item.productId, {
          productId: item.productId,
          productName: item.productName,
          quantitySold: 0,
          revenue: 0,
        });
      }
      const stats = productMap.get(item.productId)!;
      stats.quantitySold += item.quantity;
      stats.revenue += Number(item.price) * item.quantity;
    }
    // console.log('productMap', productMap);
    return Array.from(productMap.values())
      .sort((a, b) => b.quantitySold - a.quantitySold)
      .slice(0, limit);
  }

  /**
   * Get best seller categories by quantity sold or revenue
   * @param fromDate
   * @param toDate
   * @param statuses
   * @param limit
   */
  async getBestSellerCategories(
    fromDate?: string,
    toDate?: string,
    statuses?: OrderStatus[],
    limit: number = 3,
  ) {
    // Get all order items with productId
    const whereClause: any = {
      order: {
        isDeleted: false,
        status: statuses && statuses.length > 0 ? { in: statuses } : 'DELIVERED',
      },
    };
    if (fromDate && toDate) {
      whereClause.order.createdAt = {
        gte: new Date(fromDate),
        lte: new Date(toDate),
      };
    }
    // Get productId, quantity, price from order items
    const orderItems = await this.prisma.orderItem.findMany({
      where: whereClause,
      select: {
        productId: true,
        quantity: true,
        price: true,
      },
    });
    if (orderItems.length === 0) return [];
    // Get all involved productIds
    const productIds = Array.from(new Set(orderItems.map((i) => i.productId)));
    // Get productId -> categoryId, categoryName
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
      select: {
        id: true,
        categoryId: true,
      },
    });
    const categoryIds = Array.from(new Set(products.map((p) => p.categoryId)));
    // Get categoryId -> categoryName
    const categories = await this.prisma.category.findMany({
      where: { id: { in: categoryIds } },
      select: { id: true, name: true },
    });
    // Build productId -> categoryId map
    const productToCategory = new Map<number, number>();
    for (const p of products) productToCategory.set(p.id, p.categoryId);
    // Build categoryId -> { id, name, quantitySold, revenue }
    const categoryMap = new Map<
      number,
      {
        categoryId: number;
        categoryName: string;
        quantitySold: number;
        revenue: number;
      }
    >();
    for (const c of categories) {
      categoryMap.set(c.id, {
        categoryId: c.id,
        categoryName: c.name,
        quantitySold: 0,
        revenue: 0,
      });
    }
    for (const item of orderItems) {
      const categoryId = productToCategory.get(item.productId);
      if (!categoryId) continue;
      const stats = categoryMap.get(categoryId);
      if (!stats) continue;
      stats.quantitySold += item.quantity;
      stats.revenue += Number(item.price) * item.quantity;
    }
    return Array.from(categoryMap.values())
      .sort((a, b) => b.quantitySold - a.quantitySold)
      .slice(0, limit);
  }
}
