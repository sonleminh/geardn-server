import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { PrismaModule } from './modules/prisma/prisma.module';
import { ProductModule } from './modules/product/product.module';
import { CategoryModule } from './modules/category/category.module';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import { AuthModule } from './modules/auth/auth.module';
import { AdminAuthModule } from './modules/admin-auth/admin-auth.module';
import { LoggerModule } from './logger/logger.module';
import { UploadModule } from './modules/upload/upload.module';
import { AttributeValueModule } from './modules/attribute-value/attribute-value.module';
import { ProductSkuModule } from './modules/product-sku/product-sku.module';
import { CartModule } from './modules/cart/cart.module';
import { PaymentMethodModule } from './modules/payment-method/payment-method.module';
import { OrdersModule } from './modules/order/order.module';
import { AttributeModule } from './modules/attribute/attribute.module';
import { WarehouseModule } from './modules/warehouse/warehouse.module';
import { ImportLogModule } from './modules/import-log/import-log.module';
import { StockModule } from './modules/stock/stock.module';
import { EnumModule } from './common/modules/enum.module';
import { ExportLogModule } from './modules/export-log/export-log.module';
import { AdjustmentLogModule } from './modules/adjustment-log/adjustment-log.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: ['.env.production', '.env.local'],
    }),
    AuthModule,
    AdminAuthModule,
    AttributeValueModule,
    AttributeModule,
    AdjustmentLogModule,
    CartModule,
    CategoryModule,
    EnumModule,
    LoggerModule,
    ImportLogModule,
    ExportLogModule,
    OrdersModule,
    PaymentMethodModule,
    PrismaModule,
    ProductModule,
    ProductSkuModule,
    UploadModule,
    WarehouseModule,
    StockModule,
  ],
  controllers: [AppController],
  // providers: [{ provide: APP_FILTER, useClass: AllExceptionFilter }],
})
export class AppModule {}
