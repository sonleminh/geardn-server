import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OrderReturnRequestController } from './order-return-request.controller';
import { ImportLogModule } from '../import-log/import-log.module';
import { OrderReturnRequestService } from './order-return-request.service';

@Module({
  controllers: [OrderReturnRequestController],
  providers: [OrderReturnRequestService, PrismaService],
  imports: [ImportLogModule],
})
export class OrderReturnRequestModule {}
