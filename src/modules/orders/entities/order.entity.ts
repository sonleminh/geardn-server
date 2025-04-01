import { ApiProperty } from '@nestjs/swagger';
import { Order, OrderStatus } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

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
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
