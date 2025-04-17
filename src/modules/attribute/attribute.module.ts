import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AttributeController } from './attribute.controller';
import { AttributeService } from './attribute.service';

@Module({
  controllers: [AttributeController],
  providers: [AttributeService],
  imports: [PrismaModule],
})
export class AttributeModule {}
