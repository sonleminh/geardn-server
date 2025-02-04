import { Module } from '@nestjs/common';
import { ProductAttributesService } from './product-attributes.service';
import { ProductAttributesController } from './product-attributes.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  controllers: [ProductAttributesController],
  providers: [ProductAttributesService],
  imports: [PrismaModule],
})
export class ProductAttributesModule {}
