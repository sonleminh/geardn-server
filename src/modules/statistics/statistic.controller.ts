import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { StatisticsService } from './statistic.service';
import { GetRevenueStatsDto } from './dto/get-revenue-stats.dto';
import { GetProfitStatsDto } from './dto/get-profit-stats.dto';
import { GetTimeRangeStatsDto } from './dto/get-time-range-stats.dto';
import { GetProductStatsDto } from './dto/get-product-stats.dto';
import { GetOrderStatsDto } from './dto/get-order-stats.dto';
import { JwtAdminAuthGuard } from '../admin-auth/guards/jwt-admin-auth.guard';

@Controller('statistics')
@UseGuards(JwtAdminAuthGuard)
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Get('revenue')
  async getRevenueStats(@Query() dto: GetRevenueStatsDto) {
    const stats = await this.statisticsService.getRevenueStats({
      fromDate: dto.fromDate,
      toDate: dto.toDate,
    });

    return {
      data: stats,
      message: 'Revenue statistics retrieved successfully',
    };
  }

  @Get('profit')
  async getProfitStats(@Query() dto: GetProfitStatsDto) {
    const stats = await this.statisticsService.getProfitStats({
      fromDate: dto.fromDate,
      toDate: dto.toDate,
    });

    return {
      data: stats,
      message: 'Profit statistics retrieved successfully',
    };
  }

  @Get('revenue-profit')
  async getRevenueProfitStats(@Query() dto: GetRevenueStatsDto) {
    return this.statisticsService.getRevenueProfitStats({
      fromDate: dto.fromDate,
      toDate: dto.toDate,
    });
  }

  @Get('revenue-profit-summary')
  async getRevenueProfitSummary() {
    return this.statisticsService.getRevenueProfitSummary();
  }

  @Get('order')
  async getOrderStats(@Query() dto: GetOrderStatsDto) {
    return this.statisticsService.getOrderStats({
      fromDate: dto.fromDate,
      toDate: dto.toDate,
    });
  }

  @Get('order-summary')
  async getOrderSummary() {
    return this.statisticsService.getOrderSummary();
  }

  // @Get('revenue-profit/daily')
  // async getRevenueProfitDailyStats(@Query() query: GetRevenueProfitStatsDto) {
  //   const dailyStats = await this.statisticsService.getDailyStats(
  //     query.fromDate,
  //     query.toDate,
  //   );
  //   return {
  //     data: dailyStats.map(stat => ({
  //       date: stat.startDate,
  //       revenue: stat.revenue,
  //       profit: stat.profit,
  //     })),
  //     message: 'Daily revenue and profit statistics retrieved successfully',
  //   };
  // }

  @Get('products')
  async getProductStats(@Query() dto: GetProductStatsDto) {
    const stats = await this.statisticsService.getProductStats({
      fromDate: dto.fromDate,
      toDate: dto.toDate,
    });

    return {
      data: stats,
      message: 'Product statistics retrieved successfully',
    };
  }

  @Get('daily')
  async getDailyStats(@Query() dto: GetTimeRangeStatsDto) {
    const stats = await this.statisticsService.getRevenueProfitStats({
      fromDate: dto.fromDate,
      toDate: dto.toDate,
    });

    return {
      data: stats,
      message: 'Daily statistics retrieved successfully',
    };
  }

  // @Get('monthly')
  // async getMonthlyStats(@Query() query: GetMonthlyStatsDto) {
  //   const stats = await this.statisticsService.getMonthlyStats(
  //     query.year,
  //     query.statuses,
  //   );

  //   return {
  //     data: stats,
  //     message: 'Monthly statistics retrieved successfully',
  //   };
  // }

  @Get('overview')
  async getDashboardOverview() {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 29); // 30 days including today

    const fromDate = startDate.toISOString().split('T')[0];
    const toDate = endDate.toISOString();

    const [
      revenueProfitSummary,
      orderSummary,
      bestSellingProduct,
      bestSellingCategory,
    ] = await Promise.all([
      this.statisticsService.getRevenueProfitSummary(),
      this.statisticsService.getOrderSummary(),
      this.statisticsService.getBestSellerProducts({ fromDate, toDate }),
      this.statisticsService.getBestSellerCategories({ fromDate, toDate }),
    ]);

    return {
      data: {
        total: {
          revenue: revenueProfitSummary.totals.totalRevenue,
          profit: revenueProfitSummary.totals.totalProfit,
          totalCurrentMonthRevenue: revenueProfitSummary.totals.totalCurrentMonthRevenue,
          orders: orderSummary.totals.delivered,
          pendingOrders: orderSummary.totals.pending,
          canceledOrders: orderSummary.totals.canceled,
          deliveredOrders: orderSummary.totals.delivered,
          // canceledThisMonthCount: orderSummary.totals.canceledThisMonthCount,
          deliveredThisMonthCount: orderSummary.totals.deliveredThisMonthCount,
          // deliveredLastMonthCount: orderSummary.totals.deliveredLastMonthCount,
          // cancellationRate: orderSummary.rates.cancellationRate,
        },
        growth: {
          revenue: revenueProfitSummary.growth.revenuePercent,
          profit: revenueProfitSummary.growth.profitPercent,
          delivered: orderSummary.growth.delivered,
        },
        bestSellingProduct: bestSellingProduct,
        bestSellingCategory: bestSellingCategory,
      },
      message: '30-day overview statistics retrieved successfully',
    };
  }

  @Get('stock-summary')
  async getStockSummary() {
    const stats = await this.statisticsService.getStockSummary();

    return {
      data: stats,
      message: 'Stock summary retrieved successfully',
    };
  }
}
