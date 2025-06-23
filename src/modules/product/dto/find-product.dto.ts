import { IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { BaseQueryDto } from 'src/common/dto/base-query.dto';
import { ProductStatus } from '@prisma/client';

export class FindProductsDto extends BaseQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  categoryIds?: string;

  @IsOptional()
  @Transform(({ value }) => {
    if (!value) return undefined;
    return value.split(',').map((type: string) => type as ProductStatus);
  })
  statuses?: ProductStatus[];
}