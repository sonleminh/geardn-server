import { ApiProperty } from '@nestjs/swagger';
import { CreateProductSKUAttributeDto } from './create-product-sku-attribute.dto.ts';
import { IsNotEmpty } from 'class-validator';

export class CreateProductSkusDto {
  @ApiProperty()
  @IsNotEmpty()
  productId: number;

  @ApiProperty()
  sku: string;

  @ApiProperty()
  @IsNotEmpty()
  price: number;

  @ApiProperty()
  @IsNotEmpty()
  quantity: number;

  @ApiProperty()
  @IsNotEmpty()
  attributes: CreateProductSKUAttributeDto[];
}