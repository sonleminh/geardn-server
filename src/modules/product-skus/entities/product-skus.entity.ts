import { ApiProperty } from '@nestjs/swagger';
import { Product, ProductSKU, ProductSKUAttribute } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

export class ProductSkusEntity implements ProductSKU {
  @ApiProperty()
  id: number;

  @ApiProperty()
  productId: number;

  @ApiProperty()
  sku: string;

  @ApiProperty()
  price: Decimal;

  @ApiProperty()
  quantity: number;

  @ApiProperty()
  imageUrl: string;

  @ApiProperty({ default: false })
  isDeleted: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty()
  product: Product;

  @ApiProperty()
  attributes: ProductSKUAttribute[];
}
