import { Controller, Req, Sse, UseGuards, MessageEvent, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import IORedis from 'ioredis';
import { Observable, Subject } from 'rxjs';
import { JwtAdminAuthGuard } from '../admin-auth/guards/jwt-admin-auth.guard';

@UseGuards(JwtAdminAuthGuard)
@Controller('realtime')
export class RealtimeController implements OnModuleInit, OnModuleDestroy {
  private sub!: IORedis;
  private subscribed = false;

  constructor(private readonly config: ConfigService) {}

  onModuleInit() {
    this.sub = new IORedis({
      host: this.config.get<string>('REDIS_HOST', '127.0.0.1'),
      port: parseInt(this.config.get<string>('REDIS_PORT', '6379'), 10),
      password: this.config.get<string>('REDIS_PASSWORD', ''),
    });
  }

  async onModuleDestroy() {
    if (this.sub) await this.sub.quit();
  }

  @Sse('stream')
  stream(@Req() req): Observable<MessageEvent> {
    const userId = req.user?.id;
    const channel = 'admin.notifications';
    const source = new Subject<MessageEvent>();

    // đăng ký kênh một lần cho toàn controller
    if (!this.subscribed) {
      this.sub.subscribe(channel);
      this.subscribed = true;
    }

    // handler riêng cho client này
    const handler = (_: string, msg: string) => {
      try {
        const n = JSON.parse(msg);
        // if (n?.recipients?.some((r: any) => r.userId === userId)) {
        source.next({ type: 'NEW_NOTIFICATION', data: n });
        // }
      } catch {}
    };

    this.sub.on('message', handler);

    // cleanup khi client ngắt kết nối
    req.on('close', () => {
      this.sub.off('message', handler);
      source.complete();
    });

    return source.asObservable();
  }
}
