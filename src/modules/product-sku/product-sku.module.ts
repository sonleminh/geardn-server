import { Module } from '@nestjs/common';
import { ProductSkuService } from './product-sku.service';
import { ProductSkuController } from './product-sku.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { FirebaseModule } from '../firebase/firebase.module';

@Module({
  imports: [PrismaModule, FirebaseModule],
  controllers: [ProductSkuController],
  providers: [ProductSkuService],
  exports: [ProductSkuService],
})
export class ProductSkuModule {}
