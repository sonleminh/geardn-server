import { Module } from '@nestjs/common';
import { GoogleAnalyticsService } from './google-analytics.service';
import { GoogleAnalyticsController } from './google-analytics.controller';

@Module({
  providers: [GoogleAnalyticsService],
  controllers: [GoogleAnalyticsController],
  exports: [GoogleAnalyticsService],
})
export class GoogleAnalyticsModule {}