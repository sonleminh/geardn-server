import { Module } from '@nestjs/common';
import { AttributeTypesService } from './attribute-types.service';
import { AttributeTypesController } from './attribute-types.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  controllers: [AttributeTypesController],
  providers: [AttributeTypesService],
  imports: [PrismaModule],
})
export class AttributeTypesModule {}
