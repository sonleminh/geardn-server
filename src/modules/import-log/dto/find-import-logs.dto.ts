import { Transform } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { ImportType } from '@prisma/client';

export class FindImportLogsDto {
  @IsOptional()
  @Transform(({ value }) => {
    if (!value) return undefined;
    return value.split(',').map(Number);
  })
  warehouseIds?: number[];

  @IsOptional()
  @Transform(({ value }) => {
    if (!value) return undefined;
    return value.split(',').map((type: string) => type as ImportType);
  })
  types?: ImportType[];

  @IsOptional()
  @IsString()
  sort?: 'asc' | 'desc' = 'desc';

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