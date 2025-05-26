import { ExportType, ImportType } from '@prisma/client';
import { Transform } from 'class-transformer';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class FindExportLogsDto {
  @IsOptional()
  @Transform(({ value }) => {
    if (!value) return undefined;
    return value.split(',').map(Number);
  })
  warehouseIds?: number[];

  @IsOptional()
  @Transform(({ value }) => {
    if (!value) return undefined;
    return value.split(',').map((type: string) => type as ExportType);
  })
  types?: ExportType[];

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