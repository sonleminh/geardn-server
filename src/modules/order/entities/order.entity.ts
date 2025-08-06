import { ApiProperty } from '@nestjs/swagger';
import { Order, OrderReasonCode, OrderStatus } from '@prisma/client';
import { Decimal, JsonObject } from '@prisma/client/runtime/library';

export class OrderEntity implements Order {
  @ApiProperty()
  id: number;

  @ApiProperty()
  orderCode: string;

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
  email: string;

  @ApiProperty()
  note: string;

  @ApiProperty()
  flag: JsonObject;

  @ApiProperty()
  shipment: JsonObject;

  @ApiProperty()
  cancelReason: string;

  @ApiProperty()
  cancelReasonCode: OrderReasonCode;

  @ApiProperty()
  isDeleted: boolean;

  @ApiProperty()
  confirmedAt: Date;

  @ApiProperty()
  completedAt: Date;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
