import { ApiProperty } from '@nestjs/swagger';
import {
  AdjustmentLog,
  AdjustmentReason,
  AdjustmentType,
} from '@prisma/client';

export class AdjustmentLogEntity implements AdjustmentLog {
  @ApiProperty()
  id: number;

  @ApiProperty()
  warehouseId: number;

  @ApiProperty()
  reason: AdjustmentReason;

  @ApiProperty()
  type: AdjustmentType;

  @ApiProperty()
  note: string;

  @ApiProperty()
  referenceCode: string;

  @ApiProperty()
  createdBy: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
