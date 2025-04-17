import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateImportLogDto {
  @IsInt()
  skuId: number;

  @IsInt()
  warehouseId: number;

  @IsInt()
  @Min(1)
  quantity: number;

  @IsOptional()
  @IsString()
  note?: string;
}
