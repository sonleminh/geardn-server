import { IsOptional, IsString } from 'class-validator';
import { BaseQueryDto } from 'src/common/dto/base-query.dto';

export class SearchProductsDto extends BaseQueryDto {
  @IsOptional()
  @IsString()
  keyword?: string;

  @IsOptional()
  @IsString()
  cursor?: string;
}
