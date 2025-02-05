import { ApiProperty } from '@nestjs/swagger';
import { CreateProductSKUAttributeDto } from './create-product-sku-attribute.dto.ts';

export class CreateProductSkusDto {
  @ApiProperty()
  productId: number;

  @ApiProperty()
  sku: string;

  @ApiProperty()
  price: number;

  @ApiProperty()
  quantity: number;

  @ApiProperty()
  attributes: CreateProductSKUAttributeDto[];
}