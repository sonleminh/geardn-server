import { IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { BaseQueryDto } from 'src/common/dto/base-query.dto';
import { ProductStatus } from '@prisma/client';

export class FindProductsDto extends BaseQueryDto {
  @IsOptional()
  @IsString()
  search?: string;
}