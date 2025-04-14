import { Module } from '@nestjs/common';
import { AttributeValuesService } from './attribute-values.service';
import { AttributeValuesController } from './attribute-values.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  controllers: [AttributeValuesController],
  providers: [AttributeValuesService],
  imports: [PrismaModule],
})
export class AttributeValuesModule {}
