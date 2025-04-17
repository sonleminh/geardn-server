import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { WarehouseService } from './warehouse.service';
import { WarehouseController } from './warehouse.controller';

@Module({
  controllers: [WarehouseController],
  providers: [WarehouseService],
  imports: [PrismaModule],
})
export class WarehouseModule {}
