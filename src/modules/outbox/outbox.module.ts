import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { OutboxPoller } from './outbox.poller';

// outbox.module.ts -> queue "outbox-sync"
@Module({
  imports: [BullModule.registerQueue({ name: 'outbox-sync' })],
  providers: [OutboxPoller],
})
export class OutboxModule {}
