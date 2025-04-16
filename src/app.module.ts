import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { PrismaModule } from './modules/prisma/prisma.module';
import { ProductsModule } from './modules/products/products.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import { AuthModule } from './modules/auth/auth.module';
import { AdminAuthModule } from './modules/admin-auth/admin-auth.module';
import { LoggerModule } from './logger/logger.module';
import { UploadModule } from './modules/upload/upload.module';
import { AttributeValuesModule } from './modules/attribute-values/attribute-values.module';
import { ProductSkusModule } from './modules/product-skus/product-skus.module';
import { CartsModule } from './modules/carts/carts.module';
import { PaymentMethodModule } from './modules/payment-methods/payment-method.module';
import { OrdersModule } from './modules/orders/orders.module';
import { AttributesModule } from './modules/attributes/attributes.module';
import { WarehousesModule } from './modules/warehouses/warehouses.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: ['.env.production', '.env.local'],
    }),
    AuthModule,
    AdminAuthModule,
    CartsModule,
    CategoriesModule,
    LoggerModule,
    OrdersModule,
    PaymentMethodModule,
    PrismaModule,
    AttributeValuesModule,
    AttributesModule,
    ProductsModule,
    ProductSkusModule,
    UploadModule,
    WarehousesModule,
  ],
  controllers: [AppController],
  // providers: [{ provide: APP_FILTER, useClass: AllExceptionFilter }],
})
export class AppModule {}
