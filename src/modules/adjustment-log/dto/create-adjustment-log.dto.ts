import { AdjustmentReason, AdjustmentType, ExportType } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import {
  IsArray,
  IsDate,
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
  @IsDate()
  adjustmentDate: Date;

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
}
