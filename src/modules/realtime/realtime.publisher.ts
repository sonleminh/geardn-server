import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import IORedis from 'ioredis';

@Injectable()
export class RealtimePublisher {
  constructor(private configService: ConfigService) {}

  private redis = new IORedis({
    host: this.configService.get<string>('REDIS_HOST', '127.0.0.1'),
    port: parseInt(this.configService.get<string>('REDIS_PORT', '6379'), 10),
    password: this.configService.get<string>('REDIS_PASSWORD', ''),
  });
  async publish(notification: any) {
    await this.redis.publish(
      'admin.notifications',
      JSON.stringify(notification),
    );
  }
}
