import { IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { BaseQueryDto } from 'src/common/dto/base-query.dto';
import { ProductStatus } from '@prisma/client';

export class ProductListQueryDto extends BaseQueryDto {
  @IsOptional()
  limit: number = 9;
}