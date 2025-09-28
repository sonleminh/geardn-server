import { Decimal, JsonObject } from '@prisma/client/runtime/library';
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
  skuId: number;

  // @IsString()
  // @IsNotEmpty()
  // skuCode: string;

  // @IsNumber()
  // @IsNotEmpty()
  // productId: number;

  // @IsString()
  // @IsNotEmpty()
  // productName: string;

  // @IsString()
  // @IsNotEmpty()
  // productSlug: string;

  // @IsString()
  // @IsOptional()
  // imageUrl?: string;

  @IsNumber()
  @Min(1)
  quantity: number;

  // sellingPrice: number;

  // @IsNumber()
  // @Min(0)
  // @IsOptional()
  // unitCost?: number; 

  // @IsArray()
  // @ValidateNested({ each: true })
  // @Type(() => SkuAttributeDto)
  // skuAttributes: SkuAttributeDto[];
}