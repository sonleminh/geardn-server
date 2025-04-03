import { ApiProperty } from '@nestjs/swagger';
import { OrderStatus } from '@prisma/client';
import { Decimal, JsonObject } from '@prisma/client/runtime/library';
import { IsArray, IsInt, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateOrderItemDto {
  @IsInt()
  skuId: number;

  @IsInt()
  quantity: number;
}

export class CreateOrderDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  @IsNotEmpty()
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
  items: CreateOrderItemDto[];

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
