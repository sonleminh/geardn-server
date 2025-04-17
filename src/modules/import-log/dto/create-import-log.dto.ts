import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateImportLogDto {
  @IsNotEmpty()
  @IsInt()
  warehouseId: number;

  @IsOptional()
  @IsString()
  note?: string;

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
  @IsInt()
  price: number;

  @IsNotEmpty()
  @IsInt()
  note?: string;
}
