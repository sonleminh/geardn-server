import { ApiProperty } from '@nestjs/swagger';
import { Product, ProductSKU, ProductSKUAttribute } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

export class ProductSkuEntity implements ProductSKU {
  @ApiProperty()
  id: number;

  @ApiProperty()
  productId: number;

  @ApiProperty()
  sku: string;

  @ApiProperty()
  price: Decimal;

  @ApiProperty()
  costPrice: Decimal;

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
  attribute: ProductSKUAttribute[];
}
