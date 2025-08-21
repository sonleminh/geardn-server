import { Controller, Req, Sse } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import IORedis from 'ioredis';
import { Observable, Subject } from 'rxjs';

@Controller('realtime')
export class RealtimeController {
  constructor(private configService: ConfigService) {}
  private sub = new IORedis({
    host: this.configService.get<string>('REDIS_HOST', 'localhost'),
    port: this.configService.get<number>('REDIS_PORT', 6379),
  });

  @Sse('stream')
  async stream(@Req() req): Promise<Observable<MessageEvent>> {
    const userId = req.user.id;
    const channel = 'admin.notifications';
    const source = new Subject<MessageEvent>();

    this.sub.subscribe(channel);
    this.sub.on('message', (_, msg) => {
      const n = JSON.parse(msg);
      // lọc theo recipient
      if (n.recipients?.some((r: any) => r.userId === userId)) {
        source.next({ type: 'NEW_NOTIFICATION', data: n } as any);
      }
    });

    return source.asObservable();
  }
}
