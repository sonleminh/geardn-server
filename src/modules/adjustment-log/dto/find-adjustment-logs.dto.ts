import { AdjustmentReason, AdjustmentType } from '@prisma/client';
import { Transform } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import { BaseQueryDto } from '../../../common/dto/base-query.dto';

export class FindAdjustmentLogsDto extends BaseQueryDto {
  @IsOptional()
  @Transform(({ value }) => {
    if (!value) return undefined;
    return value.split(',').map(Number);
  })
  warehouseIds?: number[];

  @IsOptional()
  @Transform(({ value }) => {
    if (!value) return undefined;
    return value.split(',').map((type: string) => type as AdjustmentType);
  })
  types?: AdjustmentType[];

  @IsOptional()
  @Transform(({ value }) => {
    if (!value) return undefined;
    return value.split(',').map((type: string) => type as AdjustmentReason);
  })
  reasons?: AdjustmentReason[];

  @IsOptional()
  @Transform(({ value }) => {
    if (!value) return undefined;
    return value.split(',').map(Number);
  })
  productIds?: number[];

  @IsOptional()
  @IsString()
  fromDate?: string;

  @IsOptional()
  @IsString()
  toDate?: string;
} 