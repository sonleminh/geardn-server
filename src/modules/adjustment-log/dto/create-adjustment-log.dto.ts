import { AdjustmentReason, AdjustmentType, ExportType } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateAdjustmentLogDto {
  @IsNotEmpty()
  @IsInt()
  warehouseId: number;

  @IsNotEmpty()
  reason: AdjustmentReason;

  @IsNotEmpty()
  type: AdjustmentType;

  @IsOptional()
  @IsString()
  note?: string;

  @IsNotEmpty()
  @IsArray()
  items: CreateAdjustmentLogItemDto[];
}

export class CreateAdjustmentLogItemDto {
  @IsNotEmpty()
  @IsInt()
  skuId: number;

  @IsNotEmpty()
  @IsInt()
  quantityBefore: number;

  @IsNotEmpty()
  @IsInt()
  quantityChange: number;

  @IsOptional()
  @IsInt()
  costPriceBefore: Decimal;
}
