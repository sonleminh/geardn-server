import { Module } from '@nestjs/common';
import { RealtimePublisher } from '../realtime/realtime.publisher';
import { RealtimeController } from './realtime.gateway';

@Module({
  controllers: [RealtimeController],
  providers: [RealtimePublisher],
})
export class RealtimegModule {}
