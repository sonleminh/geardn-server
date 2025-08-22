import { Module } from '@nestjs/common';
import { DiagController } from './diag.controller';
import { RealtimePublisher } from '../realtime/realtime.publisher';

@Module({
  controllers: [DiagController],
  providers: [RealtimePublisher],
})
export class DiagModule {}
