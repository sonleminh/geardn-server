import { Module } from '@nestjs/common';
import { AttributesService } from './attributes.service';
import { AttributesController } from './attributes.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  controllers: [AttributesController],
  providers: [AttributesService],
  imports: [PrismaModule],
})
export class AttributesModule {}
