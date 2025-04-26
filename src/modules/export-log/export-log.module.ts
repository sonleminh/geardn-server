import { Module } from '@nestjs/common';
import { ExportLogService } from './export-log.service';
import { ExportLogController } from './export-log.controller';
import { PrismaService } from '../prisma/prisma.service';
import { WarehouseService } from '../warehouse/warehouse.service';

@Module({
  controllers: [ExportLogController],
  providers: [ExportLogService, PrismaService],
  imports: [WarehouseService],
})
export class ExportLogModule {}
