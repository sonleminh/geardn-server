import { Module } from '@nestjs/common';
import { ExportLogService } from './export-log.service';
import { ExportLogController } from './export-log.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [ExportLogController],
  providers: [ExportLogService, PrismaService],
  exports: [ExportLogService],
})
export class ExportLogModule {}
