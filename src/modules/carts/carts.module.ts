import { Module } from '@nestjs/common';
import { CartsService } from './carts.service';
import { CartsController } from './carts.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  controllers: [CartsController],
  providers: [CartsService],
  imports: [PrismaModule],
})
export class CartsModule {}
