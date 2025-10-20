import { Transform } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';
import { BaseQueryDto } from 'src/common/dto/base-query.dto';

export class ProductListByCateQueryDto extends BaseQueryDto {
  @IsOptional()
  @IsString()
  cursor?: string; // base64 opaque
}
