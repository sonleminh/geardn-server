import { Module } from '@nestjs/common';
import { ImportLogService } from './import-log.service';
import { ImportLogController } from './import-log.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [ImportLogController],
  providers: [ImportLogService, PrismaService],
})
export class ImportLogModule {}
