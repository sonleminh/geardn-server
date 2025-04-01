import { ApiProperty } from '@nestjs/swagger';
import { OrderItem, OrderStatus } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { IsArray, IsInt } from 'class-validator';

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
  userId: number;

  @ApiProperty()
  status: OrderStatus;

  @ApiProperty()
  paymentMethodId: number;

  @ApiProperty()
  quantity: number;

  @ApiProperty()
  totalPrice: Decimal;

  @ApiProperty()
  @IsArray()
  items: CreateOrderItemDto[];

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
