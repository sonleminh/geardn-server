import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { StatisticsService } from './statistics.service';
import { GetRevenueStatsDto } from './dto/get-revenue-stats.dto';
import { GetProfitStatsDto } from './dto/get-profit-stats.dto';
import { GetTimeRangeStatsDto } from './dto/get-time-range-stats.dto';
import { GetProductStatsDto } from './dto/get-product-stats.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetRevenueProfitStatsDto } from './dto/get-revenue-profit-stats.dto';
import { GetOrderStatsDto } from './dto/get-order-stats.dto';

@Controller('statistics')
@UseGuards(JwtAuthGuard)
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Get('revenue')
  async getRevenueStats(@Query() query: GetRevenueStatsDto) {
    const stats = await this.statisticsService.getRevenueStats(
      query.fromDate,
      query.toDate,
    );

    return {
      data: stats,
      message: 'Revenue statistics retrieved successfully',
    };
  }

  @Get('profit')
  async getProfitStats(@Query() query: GetProfitStatsDto) {
    const stats = await this.statisticsService.getProfitStats(
      query.fromDate,
      query.toDate,
      // query.statuses,
    );

    return {
      data: stats,
      message: 'Profit statistics retrieved successfully',
    };
  }

  @Get('revenue-profit')
  async getRevenueProfitStats(@Query() query: GetRevenueProfitStatsDto) {
    return this.statisticsService.getRevenueProfitStats(
      query.fromDate,
      query.toDate,
    );
  }

  @Get('revenue-profit-summary')
  async getRevenueProfitSummary() {
    return this.statisticsService.getRevenueProfitSummary();
  }

  @Get('order')
  async getOrderStats(@Query() query: GetOrderStatsDto) {
    return this.statisticsService.getOrderStats(query.fromDate, query.toDate);
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
  async getProductStats(@Query() query: GetProductStatsDto) {
    const stats = await this.statisticsService.getProductStats(
      query.fromDate,
      query.toDate,
      query.statuses,
    );

    return {
      data: stats,
      message: 'Product statistics retrieved successfully',
    };
  }

  @Get('daily')
  async getDailyStats(@Query() query: GetTimeRangeStatsDto) {
    const stats = await this.statisticsService.getRevenueProfitStats(
      query.fromDate,
      query.toDate,
      query.statuses,
    );

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
      revenueStats,
      profitStats,
      pendingRevenueStats,
      bestSellingProduct,
      bestSellingCategory,
    ] = await Promise.all([
      this.statisticsService.getRevenueStats(fromDate, toDate),
      this.statisticsService.getProfitStats(fromDate, toDate),
      this.statisticsService.getRevenueStats(fromDate, toDate, [
        'PENDING',
        'PROCESSING',
        'SHIPPED',
      ]),
      this.statisticsService.getBestSellerProducts(fromDate, toDate, [
        'DELIVERED',
      ]),
      this.statisticsService.getBestSellerCategories(fromDate, toDate, [
        'DELIVERED',
      ]),
    ]);

    return {
      data: {
        totalRevenue: revenueStats.totalRevenue,
        totalProfit: profitStats.totalProfit,
        totalOrders: revenueStats.totalOrders,
        pendingOrders: pendingRevenueStats.totalOrders,
        bestSellingProduct: bestSellingProduct,
        bestSellingCategory: bestSellingCategory,
      },
      message: '30-day overview statistics retrieved successfully',
    };
  }
}
