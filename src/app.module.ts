import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { PrismaModule } from './modules/prisma/prisma.module';
import { ProductsModule } from './modules/products/products.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import { AuthModule } from './modules/auth/auth.module';
import { AdminAuthModule } from './modules/admin-auth/admin-auth.module';
import { APP_FILTER } from '@nestjs/core';
import { LoggerModule } from './logger/logger.module';
import { UploadModule } from './modules/upload/upload.module';
import { ProductAttributesModule } from './modules/product-attributes/product-attributes.module';
import { ProductSkusModule } from './modules/product-skus/product-skus.module';
import { CartsModule } from './modules/carts/carts.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: ['.env.production', '.env.local'],
    }),
    AuthModule,
    AdminAuthModule,
    PrismaModule,
    ProductsModule,
    CategoriesModule,
    UploadModule,
    LoggerModule,
    ProductAttributesModule,
    ProductSkusModule,
    CartsModule,
  ],
  controllers: [AppController],
  // providers: [{ provide: APP_FILTER, useClass: AllExceptionFilter }],
})
export class AppModule {}
