/* eslint-disable prettier/prettier, linebreak-style */
import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { NotificationsProcessor } from './notification.processor';
import { RealtimePublisher } from '../realtime/realtime.publisher';
import { NotificationsService } from './notification.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AdminNotificationsController } from './notification.controller';

@Module({
  imports: [BullModule.registerQueue({ name: 'outbox-sync' }), PrismaModule],
  controllers: [AdminNotificationsController],
  providers: [NotificationsProcessor, RealtimePublisher, NotificationsService],
  exports: [RealtimePublisher, NotificationsService],
})
export class NotificationsModule {}
