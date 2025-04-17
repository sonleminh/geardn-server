import { ApiProperty } from '@nestjs/swagger';
import { CartItem } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { IsOptional } from 'class-validator';

export class CartItemEntity implements CartItem {
  @ApiProperty()
  id: number;

  @ApiProperty()
  cartId: number;

  @ApiProperty()
  productId: number;

  @ApiProperty()
  @IsOptional()
  skuId: number;

  @ApiProperty()
  quantity: number;

  @ApiProperty()
  price: Decimal;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
