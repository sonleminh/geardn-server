// import { Controller, Get, Query } from '@nestjs/common';
// import { GoogleAnalyticsService } from './google-analytics.service';

// @Controller('analytics')
// export class GoogleAnalyticsController {
//   constructor(private readonly gaService: GoogleAnalyticsService) {}

//   @Get('viewers')
//   async getViewers(
//     @Query('startDate') startDate?: string,
//     @Query('endDate') endDate?: string,
//   ) {
//     const count = await this.gaService.getViewerCount(startDate, endDate);
//     return { count };
//   }
// }