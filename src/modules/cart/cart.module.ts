import { Module } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  controllers: [CartController],
  providers: [CartService],
  imports: [PrismaModule],
  exports: [CartService],
})
export class CartModule {}
