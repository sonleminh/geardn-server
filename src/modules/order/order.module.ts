import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { CartModule } from '../cart/cart.module';

@Module({
  controllers: [OrderController],
  providers: [OrderService, PrismaService],
  imports: [CartModule],
})
export class OrdersModule {}
