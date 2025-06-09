import { ApiProperty } from '@nestjs/swagger';
import { OrderStatus } from '@prisma/client';
import { Decimal, JsonObject } from '@prisma/client/runtime/library';
import { IsArray, IsInt, IsJSON, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateOrderItemDto {
  @IsInt()
  skuId: number;

  @IsInt()
  productId: number;

  @IsInt()
  quantity: number;

  @IsInt()
  price: number;

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
  @IsOptional()
  status: OrderStatus;

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
  @IsNotEmpty()
  phoneNumber: string;

  @ApiProperty()
  @IsNotEmpty()
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
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
