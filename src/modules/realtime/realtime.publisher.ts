import { Controller, Injectable, Req, Sse } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import IORedis from 'ioredis';
import { Observable, Subject } from 'rxjs';

@Injectable()
export class RealtimePublisher {
  constructor(private configService: ConfigService) {}

  private redis = new IORedis({
    host: this.configService.get<string>('REDIS_HOST', 'localhost'),
    port: this.configService.get<number>('REDIS_PORT', 6379),
  });
  async publish(notification: any) {
    await this.redis.publish(
      'admin.notifications',
      JSON.stringify(notification),
    );
  }
}
