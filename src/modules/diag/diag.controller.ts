import { Controller, Post } from '@nestjs/common';
import { RealtimePublisher } from '../realtime/realtime.publisher';

@Controller('diag')
export class DiagController {
  constructor(private rt: RealtimePublisher) {}
  @Post('push')
  async push() {
    const fake = {
      id: 'n-test',
      type: 'ORDER_CREATED',
      title: 'Đơn mới #999',
      createdAt: new Date().toISOString(),
      recipients: [{ userId: /* id admin của bạn */ 1 }],
    };
    await this.rt.publish(fake);
    return { ok: true };
  }
}
