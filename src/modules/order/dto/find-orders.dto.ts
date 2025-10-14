import { OrderStatus } from 'src/common/enums/order-status.enum';
import { Transform } from 'class-transformer';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { BaseQueryDto } from 'src/common/dto/base-query.dto';

export class FindOrdersDto extends BaseQueryDto {
  @IsOptional()
  @Transform(({ value }) => {
    if (!value) return undefined;
    return value.split(',').map(Number);
  })
  productIds?: number[];

  @IsOptional()
  @Transform(({ value }) => {
    if (!value) return undefined;
    return value.split(',').map((type: string) => type as OrderStatus);
  })
  statuses?: OrderStatus[];

  @IsOptional()
  @IsString()
  fromDate?: string;

  @IsOptional()
  @IsString()
  toDate?: string;

  @IsOptional()
  @IsString()
  search?: string;
} 