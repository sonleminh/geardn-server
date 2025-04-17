import { Module } from '@nestjs/common';
import { ImportLogService } from './import-log.service';
import { ImportLogController } from './import-log.controller';

@Module({
  controllers: [ImportLogController],
  providers: [ImportLogService],
})
export class ImportLogModule {}
