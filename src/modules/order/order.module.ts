import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { CartModule } from '../cart/cart.module';
import { ExportLogModule } from '../export-log/export-log.module';

@Module({
  controllers: [OrderController],
  providers: [OrderService, PrismaService],
  imports: [CartModule, ExportLogModule],
})
export class OrdersModule {}
