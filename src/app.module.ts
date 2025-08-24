import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';

import { AppController } from './app.controller';
import { PrismaModule } from './modules/prisma/prisma.module';
import { ProductModule } from './modules/product/product.module';
import { CategoryModule } from './modules/category/category.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
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
import { ProvinceModule } from './modules/province/province.module';
import { StatisticsModule } from './modules/statistics/statistic.module';
import { GoogleAnalyticsModule } from './modules/google-analytics/google-analytics.module';
import { OrderReturnRequestModule } from './modules/order-return-request/order-return-request.module';
import { DiagModule } from './modules/diag/diag.module';
import { RealtimegModule } from './modules/realtime/realtime.module';
import { ScheduleModule } from '@nestjs/schedule';
import { OutboxModule } from './modules/outbox/outbox.module';
import { NotificationsModule } from './modules/notification/notification.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: ['.env.production', '.env.local'],
    }),
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => {
        return {
          connection: {
            host: cfg.get<string>('REDIS_HOST', '127.0.0.1'),
            port: parseInt(cfg.get<string>('REDIS_PORT', '6379'), 10),
            password: cfg.get<string>('REDIS_PASSWORD') || undefined,
            ...(cfg.get('REDIS_TLS') === 'true' ? { tls: {} } : {}),
          },
        };
      },
    }),
    ScheduleModule.forRoot(),
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
    OutboxModule,
    OrderReturnRequestModule,
    PaymentMethodModule,
    PrismaModule,
    ProductModule,
    ProductSkuModule,
    UploadModule,
    WarehouseModule,
    StockModule,
    ProvinceModule,
    StatisticsModule,
    GoogleAnalyticsModule,
    DiagModule,
    RealtimegModule,
    NotificationsModule
  ],
  controllers: [AppController],
  // providers: [{ provide: APP_FILTER, useClass: AllExceptionFilter }],
})
export class AppModule {}
