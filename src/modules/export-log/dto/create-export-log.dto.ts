import { ExportType } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateExportLogDto {
  @IsNotEmpty()
  @IsInt()
  warehouseId: number;

  @IsNotEmpty()
  type: ExportType;

  @IsOptional()
  @IsInt()
  orderId: number;

  @IsOptional()
  @IsString()
  note?: string;

  @IsNotEmpty()
  @IsArray()
  items: CreateExportLogItemDto[];
}

export class CreateExportLogItemDto {
  @IsNotEmpty()
  @IsInt()
  skuId: number;

  @IsNotEmpty()
  @IsInt()
  quantity: number;

  @IsNotEmpty()
  @IsInt()
  costPrice: Decimal;

  @IsNotEmpty()
  @IsInt()
  note?: string;
}
