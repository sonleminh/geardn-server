import { Module } from '@nestjs/common';
import { CategoryService } from './category.service';
import { PrismaModule } from 'src/modules/prisma/prisma.module';
import { CategoryController } from './category.controller';

@Module({
  controllers: [CategoryController],
  providers: [CategoryService],
  imports: [PrismaModule],
  exports: [CategoryService],
})
export class CategoryModule {}
