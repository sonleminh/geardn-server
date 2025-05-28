import { IsOptional, IsString } from 'class-validator';
import { BaseQueryDto } from 'src/common/dto/base-query.dto';

export class FindProductsDto extends BaseQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  categoryIds?: string;
}