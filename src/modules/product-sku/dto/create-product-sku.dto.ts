import { ApiProperty } from '@nestjs/swagger';
import { CreateProductSKUAttributeDto } from './create-product-sku-attribute.dto.ts.js';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateProductSkuDto {
  @ApiProperty()
  @IsNotEmpty()
  productId: number;

  @ApiProperty()
  sku: string;

  @ApiProperty()
  @IsNotEmpty()
  price: number;

  @ApiProperty()
  @IsOptional()
  imageUrl: string;

  @ApiProperty()
  @IsOptional()
  attributeValues: CreateProductSKUAttributeDto[];
}