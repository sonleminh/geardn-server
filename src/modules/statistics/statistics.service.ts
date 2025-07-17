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

export interface RevenueProfitTimeRangeStats {
  date: Date;
  revenue: number;
  profit: number;
}

export interface OrderTimeRangeStats {
  date: Date;
  orders: number;
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

export interface BestSellerProduct {
  productId: number;
  productName: string;
  imageUrl: string;
  price: number;
  quantitySold: number;
  revenue: number;
}

export interface BestSellerCategory {
  categoryId: number;
  categoryName: string;
  quantitySold: number;
  revenue: number;
}

export interface DateRange {
  fromDate?: string;
  toDate?: string;
}

export interface StatsFilters extends DateRange {
  statuses?: OrderStatus[];
}

export interface MonthlyRange {
  currentFrom: string;
  currentTo: string;
  prevFrom: string;
  prevTo: string;
}

@Injectable()
export class StatisticsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Build where clause for order queries
   */
  private buildOrderWhereClause(filters: StatsFilters): any {
    const whereClause: any = {
      isDeleted: false,
      status:
        filters.statuses && filters.statuses.length > 0
          ? { in: filters.statuses }
          : 'DELIVERED',
    };

    if (filters.fromDate && filters.toDate) {
      whereClause.createdAt = {
        gte: new Date(filters.fromDate),
        lte: new Date(filters.toDate),
      };
    }

    return whereClause;
  }

  /**
   * Build where clause for order item queries
   */
  private buildOrderItemWhereClause(filters: StatsFilters): any {
    const whereClause: any = {
      order: {
        isDeleted: false,
        status:
          filters.statuses && filters.statuses.length > 0
            ? { in: filters.statuses }
            : 'DELIVERED',
      },
    };

    if (filters.fromDate && filters.toDate) {
      whereClause.order.createdAt = {
        gte: new Date(filters.fromDate),
        lte: new Date(filters.toDate),
      };
    }

    return whereClause;
  }

  /**
   * Calculate monthly date ranges
   */
  private getMonthlyRanges(): MonthlyRange {
    const now = new Date();

    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const currentMonthEnd = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
      999,
    );

    const previousMonthStart = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      1,
    );
    const previousMonthEnd = new Date(
      now.getFullYear(),
      now.getMonth(),
      0,
      23,
      59,
      59,
      999,
    );

    return {
      currentFrom: currentMonthStart.toISOString().split('T')[0],
      currentTo: currentMonthEnd.toISOString().split('T')[0],
      prevFrom: previousMonthStart.toISOString().split('T')[0],
      prevTo: previousMonthEnd.toISOString().split('T')[0],
    };
  }

  /**
   * Fill missing dates in time range stats
   */
  private fillMissingDates<T extends { date: Date }>(
    statsMap: Map<string, T>,
    fromDate: string,
    toDate: string,
    createEmptyStats: (date: Date) => T,
  ): T[] {
    const result: T[] = [];
    const current = new Date(fromDate);
    const end = new Date(toDate);

    while (current <= end) {
      const dateKey = current.toISOString().split('T')[0];

      if (statsMap.has(dateKey)) {
        result.push(statsMap.get(dateKey)!);
      } else {
        result.push(createEmptyStats(new Date(dateKey)));
      }

      current.setDate(current.getDate() + 1);
    }

    return result;
  }

  /**
   * Calculate growth percentage
   */
  private calculateGrowthPercent(current: number, previous: number): number {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  }

  async getRevenueStats(filters: DateRange = {}): Promise<RevenueStats> {
    const whereClause = this.buildOrderWhereClause(filters);

    const orders = await this.prisma.order.findMany({
      where: whereClause,
      select: {
        id: true,
        totalPrice: true,
        status: true,
      },
    });

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

  async getProfitStats(filters: DateRange = {}): Promise<ProfitStats> {
    const whereClause = this.buildOrderWhereClause(filters);

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
      const orderRevenue = Number(order.totalPrice);
      const orderCost = order.orderItems.reduce((sum, item) => {
        return sum + Number(item.costPrice || 0) * item.quantity;
      }, 0);

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

  async getRevenueProfitStats(filters: DateRange = {}): Promise<{
    revenueProfitStatsData: RevenueProfitTimeRangeStats[];
    totals: { totalRevenue: number; totalProfit: number };
  }> {
    if (!filters.fromDate || !filters.toDate) {
      throw new Error('Date range is required for revenue profit stats');
    }

    const whereClause = this.buildOrderWhereClause(filters);

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

    const dailyStatsMap = new Map<string, RevenueProfitTimeRangeStats>();

    for (const order of orders) {
      const dateKey = order.createdAt.toISOString().split('T')[0];
      const revenue = Number(order.totalPrice);
      const cost = order.orderItems.reduce((sum, item) => {
        return sum + Number(item.costPrice || 0) * item.quantity;
      }, 0);
      const profit = revenue - cost;

      if (!dailyStatsMap.has(dateKey)) {
        dailyStatsMap.set(dateKey, {
          date: new Date(dateKey),
          revenue: 0,
          profit: 0,
        });
      }

      const stats = dailyStatsMap.get(dateKey)!;
      stats.revenue += revenue;
      stats.profit += profit;
    }

    const result = this.fillMissingDates(
      dailyStatsMap,
      filters.fromDate,
      filters.toDate,
      (date) => ({ date, revenue: 0, profit: 0 }),
    );

    const totalRevenue = result.reduce((sum, stat) => sum + stat.revenue, 0);
    const totalProfit = result.reduce((sum, stat) => sum + stat.profit, 0);

    return {
      revenueProfitStatsData: result,
      totals: { totalRevenue, totalProfit },
    };
  }

  async getRevenueProfitSummary(): Promise<{
    totals: { totalRevenue: number; totalProfit: number };
    growth: { revenuePercent: number; profitPercent: number };
  }> {
    const { currentFrom, currentTo, prevFrom, prevTo } =
      this.getMonthlyRanges();

    const [
      currentStats,
      previousStats,
      { revenue: totalRevenue, profit: totalProfit },
    ] = await Promise.all([
      this.getRevenueProfitStats({ fromDate: currentFrom, toDate: currentTo }),
      this.getRevenueProfitStats({ fromDate: prevFrom, toDate: prevTo }),
      this.getTotalRevenueAndProfit(),
    ]);

    const revenueGrowthPercent = this.calculateGrowthPercent(
      currentStats.totals.totalRevenue,
      previousStats.totals.totalRevenue,
    );
    const profitGrowthPercent = this.calculateGrowthPercent(
      currentStats.totals.totalProfit,
      previousStats.totals.totalProfit,
    );

    return {
      totals: { totalRevenue, totalProfit },
      growth: {
        revenuePercent: revenueGrowthPercent,
        profitPercent: profitGrowthPercent,
      },
    };
  }

  /**
   * Get the total revenue and profit for all non-deleted orders.
   * @returns An object containing total revenue and total profit.
   */
  async getTotalRevenueAndProfit(): Promise<{
    revenue: number;
    profit: number;
    orders: any[];
  }> {
    const orders = await this.prisma.order.findMany({
      where: { isDeleted: false, status: 'DELIVERED' },
      select: {
        totalPrice: true,
        orderItems: {
          select: {
            price: true,
            costPrice: true,
            quantity: true,
          },
        },
      },
    });

    const revenue = orders.reduce(
      (sum, order) => sum + Number(order.totalPrice),
      0,
    );
    let profit = 0;
    for (const order of orders) {
      for (const item of order.orderItems) {
        profit +=
          (Number(item.price) - Number(item.costPrice || 0)) * item.quantity;
      }
    }
    return { revenue, profit, orders };
  }

  async getOrderStats(filters: DateRange): Promise<{
    orderStats: OrderTimeRangeStats[];
    totals: { orders: number };
  }> {
    if (!filters.fromDate || !filters.toDate) {
      throw new Error('Date range is required for order stats');
    }

    const whereClause = this.buildOrderWhereClause({
      ...filters,
      statuses: ['DELIVERED'],
    });

    const [orders, count] = await Promise.all([
      this.prisma.order.findMany({
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
      }),
      this.prisma.order.count({ where: whereClause }),
    ]);

    const dailyStatsMap = new Map<string, OrderTimeRangeStats>();

    for (const order of orders) {
      const dateKey = order.createdAt.toISOString().split('T')[0];

      if (!dailyStatsMap.has(dateKey)) {
        dailyStatsMap.set(dateKey, {
          date: new Date(dateKey),
          orders: 0,
        });
      }

      const stats = dailyStatsMap.get(dateKey)!;
      stats.orders += 1;
    }

    const result = this.fillMissingDates(
      dailyStatsMap,
      filters.fromDate,
      filters.toDate,
      (date) => ({ date, orders: 0 }),
    );

    return {
      orderStats: result,
      totals: { orders: count },
    };
  }

  async getOrderSummary(): Promise<{
    totals: {
      delivered: number;
      pending: number;
      canceled: number;
    };
    growth: { delivered: number };
  }> {
    const { currentFrom, currentTo, prevFrom, prevTo } =
      this.getMonthlyRanges();

    const [deliveredCount, pendingCount, canceledCount, current, previous] =
      await Promise.all([
        this.prisma.order.count({ where: { status: 'DELIVERED' } }),
        this.prisma.order.count({ where: { status: { not: 'DELIVERED' } } }),
        this.prisma.order.count({ where: { status: 'CANCELED' } }),
        this.prisma.order.count({
          where: {
            status: 'DELIVERED',
            createdAt: { gte: new Date(currentFrom), lte: new Date(currentTo) },
          },
        }),
        this.prisma.order.count({
          where: {
            status: 'DELIVERED',
            createdAt: { gte: new Date(prevFrom), lte: new Date(prevTo) },
          },
        }),
      ]);

    const deliveredGrowthPercent = this.calculateGrowthPercent(
      current,
      previous,
    );

    return {
      totals: {
        delivered: deliveredCount,
        pending: pendingCount,
        canceled: canceledCount,
      },
      growth: { delivered: deliveredGrowthPercent },
    };
  }

  async getProductStats(filters: StatsFilters = {}): Promise<ProductStats[]> {
    const whereClause = this.buildOrderItemWhereClause(filters);

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
    filters: StatsFilters,
  ): Promise<RevenueProfitTimeRangeStats[]> {
    if (!filters.fromDate || !filters.toDate) {
      throw new Error('Date range is required for daily stats');
    }

    const whereClause = this.buildOrderWhereClause(filters);

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

    const dailyStatsMap = new Map<string, RevenueProfitTimeRangeStats>();

    for (const order of orders) {
      const dateKey = order.createdAt.toISOString().split('T')[0];
      const revenue = Number(order.totalPrice);
      const cost = order.orderItems.reduce((sum, item) => {
        return sum + Number(item.costPrice || 0) * item.quantity;
      }, 0);
      const profit = revenue - cost;

      if (!dailyStatsMap.has(dateKey)) {
        dailyStatsMap.set(dateKey, {
          date: new Date(dateKey),
          revenue: 0,
          profit: 0,
        });
      }

      const stats = dailyStatsMap.get(dateKey)!;
      stats.revenue += revenue;
      stats.profit += profit;
    }

    return this.fillMissingDates(
      dailyStatsMap,
      filters.fromDate,
      filters.toDate,
      (date) => ({ date, revenue: 0, profit: 0 }),
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
    filters: DateRange = {},
    limit: number = 10,
  ): Promise<BestSellerProduct[]> {
    const whereClause = this.buildOrderItemWhereClause(filters);

    const orderItems = await this.prisma.orderItem.findMany({
      where: whereClause,
      select: {
        productId: true,
        productName: true,
        imageUrl: true,
        quantity: true,
        price: true,
      },
    });

    const productMap = new Map<
      number,
      {
        productId: number;
        productName: string;
        imageUrl: string;
        price: number;
        quantitySold: number;
        revenue: number;
      }
    >();
    for (const item of orderItems) {
      if (!productMap.has(item.productId)) {
        productMap.set(item.productId, {
          productId: item.productId,
          productName: item.productName,
          imageUrl: item.imageUrl,
          price: Number(item.price),
          quantitySold: 0,
          revenue: 0,
        });
      }
      const stats = productMap.get(item.productId)!;
      stats.quantitySold += item.quantity;
      stats.revenue += Number(item.price) * item.quantity;
    }
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
    filters: StatsFilters = {},
    limit: number = 3,
  ): Promise<BestSellerCategory[]> {
    const whereClause = this.buildOrderItemWhereClause(filters);

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
