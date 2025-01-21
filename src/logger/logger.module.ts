import { Global, Module } from '@nestjs/common';
import { LoggerFactory } from './custom.logger';

@Global()
@Module({
  providers: [LoggerFactory],
  exports: [LoggerFactory],
})
export class LoggerModule {}
