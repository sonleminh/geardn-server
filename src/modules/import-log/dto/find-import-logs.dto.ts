import { Transform } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
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

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Transform(({ value }) => {
    if (!value) return 1;
    const num = Number(value);
    return isNaN(num) ? 1 : num;
  })
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Transform(({ value }) => {
    if (!value) return 10;
    const num = Number(value);
    return isNaN(num) ? 10 : num;
  })
  limit?: number = 10;
} 