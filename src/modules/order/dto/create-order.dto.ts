import { ApiProperty } from '@nestjs/swagger';
import { OrderStatus } from '@prisma/client';
import { Decimal, JsonObject } from '@prisma/client/runtime/library';
import { IsArray, IsDecimal, IsInt, IsJSON, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateOrderItemDto {
  @IsInt()
  skuId: number;

  @IsInt()
  productId: number;

  @IsInt()
  quantity: number;

  @IsInt()
  sellingPrice: number;

  @IsDecimal()
  unitCost: number;

  @IsInt()
  imageUrl: string;

  @IsString()
  productName: string;

  @IsString()
  productSlug: string;

  @IsString()
  skuCode: string;

  @IsJSON()
  skuAttributes: JsonObject;
}

export class CreateOrderDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  @IsOptional()
  userId: number;

  @ApiProperty()
  @IsNotEmpty()
  paymentMethodId: number;

  @ApiProperty()
  @IsNotEmpty()
  totalPrice: Decimal;

  @ApiProperty()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty()
  @IsOptional()
  phoneNumber: string;

  @ApiProperty()
  @IsOptional()
  email: string;

  @ApiProperty()
  @IsOptional()
  note: string;

  @ApiProperty()
  @IsNotEmpty()
  shipment: JsonObject;

  @ApiProperty()
  @IsOptional()
  flag: JsonObject;

  @ApiProperty()
  @IsNotEmpty()
  @IsArray()
  orderItems: CreateOrderItemDto[];

  @ApiProperty()
  confirmedAt: Date;

  @ApiProperty()
  completedAt: Date;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
