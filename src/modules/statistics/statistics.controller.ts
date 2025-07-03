import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { StatisticsService } from './statistics.service';
import { GetRevenueStatsDto } from './dto/get-revenue-stats.dto';
import { GetProfitStatsDto } from './dto/get-profit-stats.dto';
import { GetTimeRangeStatsDto } from './dto/get-time-range-stats.dto';
import { GetProductStatsDto } from './dto/get-product-stats.dto';
import { GetMonthlyStatsDto } from './dto/get-monthly-stats.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
// import { RolesGuard } from '../auth/guards/roles.guard';
// import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { GetProfitRevenueStatsDto } from './dto/get-profit-revenue-stats.dto';

@Controller('statistics')
@UseGuards(JwtAuthGuard)
// @Roles(UserRole.ADMIN)
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
    const stats = await this.statisticsService.getDailyStats(
      query.fromDate,
      query.toDate,
      query.statuses,
    );

    return {
      data: stats,
      message: 'Daily statistics retrieved successfully',
    };
  }

  @Get('monthly')
  async getMonthlyStats(@Query() query: GetMonthlyStatsDto) {
    const stats = await this.statisticsService.getMonthlyStats(
      query.year,
      query.statuses,
    );

    return {
      data: stats,
      message: 'Monthly statistics retrieved successfully',
    };
  }

  @Get('dashboard')
  async getDashboardStats() {
    const currentDate = new Date();
    const startOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1,
    );
    const endOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0,
    );

    const [revenueStats, profitStats, timeRangeStats] = await Promise.all([
      this.statisticsService.getRevenueStats(
        startOfMonth.toISOString().split('T')[0],
        endOfMonth.toISOString().split('T')[0],
        // ['DELIVERED', 'SHIPPED', 'PROCESSING'],
      ),
      this.statisticsService.getProfitStats(
        startOfMonth.toISOString().split('T')[0],
        endOfMonth.toISOString().split('T')[0],
        // ['DELIVERED', 'SHIPPED', 'PROCESSING'],
      ),
      this.statisticsService.getTimeRangeStats(
        startOfMonth.toISOString().split('T')[0],
        endOfMonth.toISOString().split('T')[0],
        // ['DELIVERED', 'SHIPPED', 'PROCESSING'],
      ),
    ]);

    return {
      data: {
        currentMonth: {
          revenue: revenueStats,
          profit: profitStats,
          timeRange: timeRangeStats,
        },
      },
      message: 'Dashboard statistics retrieved successfully',
    };
  }

  // @Get('overview')
  // async getDashboardOverview() {
  //   const endDate = new Date();
  //   const startDate = new Date();
  //   startDate.setDate(endDate.getDate() - 29); // 30 days including today

  //   const fromDate = startDate.toISOString().split('T')[0];
  //   const toDate = endDate.toISOString().split('T')[0];

  //   const [revenueStats, profitStats, pendingRevenueStats, bestSellingProduct, topCategory] = await Promise.all([
  //     this.statisticsService.getRevenueStats(fromDate, toDate),
  //     this.statisticsService.getProfitStats(fromDate, toDate),
  //     this.statisticsService.getRevenueStats(fromDate, toDate, [
  //       'PENDING',
  //       'PROCESSING',
  //       'SHIPPED',
  //     ]),
  //     this.statisticsService.getProductStats(fromDate, toDate, ['DELIVERED']),
  //     this.statisticsService.getBestSellerCategories(fromDate, toDate, ['DELIVERED']),
  //   ]);

  //   return {
  //     data: {
  //       totalRevenue: revenueStats.totalRevenue,
  //       totalProfit: profitStats.totalProfit,
  //       totalOrders: revenueStats.totalOrders,
  //       pendingOrders: pendingRevenueStats.totalOrders,
  //       bestSellingProduct: bestSellingProduct,
  //       topCategory: topCategory,
  //     },
  //     message: '30-day overview statistics retrieved successfully',
  //   };
  // }

  @Get('overview')
  async getDashboardOverview() {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 29); // 30 days including today

    const fromDate = startDate.toISOString().split('T')[0];
    const toDate = endDate.toISOString().split('T')[0];

    const [
      revenueStats,
      profitStats,
      pendingRevenueStats,
      bestSellingProduct,
      topCategories,
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
        topCategories: topCategories,
      },
      message: '30-day overview statistics retrieved successfully',
    };
  }

  /**
   * Get profit and revenue stats between two dates for charting.
   */
  @Get('profit-revenue-daily')
  async getProfitRevenueDailyStats(@Query() query: GetProfitRevenueStatsDto) {
    const dailyStats = await this.statisticsService.getDailyStats(
      query.fromDate,
      query.toDate,
    );
    return {
      data: dailyStats.map(stat => ({
        date: stat.startDate,
        revenue: stat.revenue,
        profit: stat.profit,
      })),
      message: 'Daily profit and revenue statistics retrieved successfully',
    };
  }
}
