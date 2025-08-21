import { Module } from '@nestjs/common';
import { StatisticsController } from './statistic.controller';
import { StatisticsService } from './statistic.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  controllers: [StatisticsController],
  providers: [StatisticsService],
  imports: [PrismaModule],
  exports: [StatisticsService],
})
export class StatisticsModule {}
