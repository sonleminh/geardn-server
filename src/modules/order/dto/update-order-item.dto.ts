import { JsonObject } from '@prisma/client/runtime/library';
import { Transform, Type } from 'class-transformer';
import {
  IsNumber,
  IsOptional,
  IsString,
  Min,
  IsNotEmpty,
  IsObject,
  IsArray,
  ValidateNested,
} from 'class-validator';

class SkuAttributeDto {
  @IsString()
  attribute: string;

  @IsString()
  value: string;
}
export class UpdateOrderItemDto {
  @IsNumber()
  @IsNotEmpty()
  productId: number;

  @IsNumber()
  @IsNotEmpty()
  skuId: number;

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsNumber()
  @Min(0)
  sellingPrice: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  unitCost?: number;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsString()
  @IsNotEmpty()
  productName: string;

  @IsString()
  @IsNotEmpty()
  productSlug: string;

  @IsString()
  @IsNotEmpty()
  skuCode: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SkuAttributeDto)
  skuAttributes: SkuAttributeDto[];

  @IsNumber()
  @IsOptional()
  warehouseId?: number;
} 