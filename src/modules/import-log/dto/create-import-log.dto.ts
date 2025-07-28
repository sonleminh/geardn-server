import { ImportType } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import {
  IsArray,
  IsDate,
  IsDecimal,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateImportLogDto {
  @IsNotEmpty()
  @IsInt()
  warehouseId: number;

  @IsNotEmpty()
  type: ImportType;

  @IsOptional()
  @IsString()
  note?: string;

  @IsNotEmpty()
  @IsDate()
  importDate: Date;

  @IsNotEmpty()
  @IsArray()
  items: CreateImportLogItemDto[];
}

export class CreateImportLogItemDto {
  @IsNotEmpty()
  @IsInt()
  skuId: number;

  @IsNotEmpty()
  @IsInt()
  quantity: number;

  @IsNotEmpty()
  @IsDecimal()
  unitCost: Decimal;

  @IsNotEmpty()
  @IsInt()
  note?: string;
}
