import { Module } from '@nestjs/common';
import { AdjustmentLogService } from './adjustment-log.service';
import { AdjustmentLogController } from './adjustment-log.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [AdjustmentLogController],
  providers: [AdjustmentLogService, PrismaService],
})
export class AdjustmentLogModule {}
