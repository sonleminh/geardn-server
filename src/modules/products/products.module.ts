import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { PrismaModule } from 'src/modules/prisma/prisma.module';
import { CategoriesModule } from '../categories/categories.module';
import { ProductSkusModule } from '../product-skus/product-skus.module';

@Module({
  controllers: [ProductsController],
  providers: [ProductsService],
  imports: [PrismaModule, CategoriesModule, ProductSkusModule],
})
export class ProductsModule {}
