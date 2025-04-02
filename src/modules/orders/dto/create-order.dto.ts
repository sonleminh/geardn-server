import { ApiProperty } from '@nestjs/swagger';
import { OrderStatus } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
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
  @IsNotEmpty()
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
  address: string;

  @ApiProperty()
  @IsOptional()
  note: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsArray()
  items: CreateOrderItemDto[];

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
