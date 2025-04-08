import { Module } from '@nestjs/common';
import { CartsModule } from '../carts/carts.module';
import { PrismaService } from '../prisma/prisma.service';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';

@Module({
  controllers: [OrdersController],
  providers: [OrdersService, PrismaService],
  imports: [CartsModule],
})
export class OrdersModule {}
