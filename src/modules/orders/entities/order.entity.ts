import { ApiProperty } from '@nestjs/swagger';
import { Order, OrderStatus } from '@prisma/client';
import { Decimal, JsonObject } from '@prisma/client/runtime/library';

export class OrderEntity implements Order {
  @ApiProperty()
  id: number;

  @ApiProperty()
  userId: number;

  @ApiProperty()
  totalPrice: Decimal;

  @ApiProperty()
  status: OrderStatus;

  @ApiProperty()
  paymentMethodId: number;

  @ApiProperty()
  fullName: string;

  @ApiProperty()
  phoneNumber: string;

  @ApiProperty()
  address: string;

  @ApiProperty()
  note: string;

  @ApiProperty()
  flag: JsonObject;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
