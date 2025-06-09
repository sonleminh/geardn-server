import { Type } from 'class-transformer';
import {
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Min,
  IsNotEmpty,
} from 'class-validator';

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
  price: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  costPrice?: number;

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

  @IsObject()
  @IsNotEmpty()
  skuAttributes: Record<string, any>;

  @IsNumber()
  @IsOptional()
  warehouseId?: number;
} 