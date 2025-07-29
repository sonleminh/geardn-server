
import { ApiProperty } from '@nestjs/swagger';
import { Decimal } from '@prisma/client/runtime/library';
import { IsOptional } from 'class-validator';

export class CreateOrderItemDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  orderId: number;

  @ApiProperty()
  productId: number;

  @ApiProperty()
  productName: string;

  @ApiProperty()
  productSlug: string;

  @ApiProperty()
  imageUrl: string;

  @ApiProperty()
  skuCode: string;

  @ApiProperty()
  @IsOptional()
  skuId: number;

  @ApiProperty()
  quantity: number;

  @ApiProperty()
  sellingPrice: number;

  @ApiProperty()
  @IsOptional()
  unitCost?: number;

  @ApiProperty()
  skuAttributes: Record<string, any>;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
