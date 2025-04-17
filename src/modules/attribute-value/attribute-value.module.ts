import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AttributeValueController } from './attribute-value.controller';
import { AttributeValueService } from './attribute-value.service';

@Module({
  controllers: [AttributeValueController],
  providers: [AttributeValueService],
  imports: [PrismaModule],
})
export class AttributeValueModule {}
