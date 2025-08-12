import { ApiProperty } from '@nestjs/swagger';
import { Order, OrderReturnRequest, ReturnRequestType, ReturnStatus } from '@prisma/client';
import { OrderStatus } from 'src/common/enums/order-status.enum';
import { OrderReasonCode } from 'src/common/enums/order-reason-code';
import { Decimal, JsonObject } from '@prisma/client/runtime/library';

export class OrderReturnRequestEntity implements OrderReturnRequest {
  @ApiProperty()
  id: number;

  @ApiProperty()
  orderId: number;

  @ApiProperty()
  status: ReturnStatus;

  @ApiProperty()
  type: ReturnRequestType;

  @ApiProperty()
  reasonCode: OrderReasonCode;

  @ApiProperty()
  reasonNote: string;

  @ApiProperty()
  createdById: number;

  @ApiProperty()
  approvedById: number;

  @ApiProperty()
  completedAt: Date;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
