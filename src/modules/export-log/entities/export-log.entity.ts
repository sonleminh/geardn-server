import { ApiProperty } from '@nestjs/swagger';
import { ExportLog, ExportType } from '@prisma/client';

export class ExportLogEntity implements ExportLog {
  @ApiProperty()
  id: number;

  @ApiProperty()
  warehouseId: number;

  @ApiProperty()
  type: ExportType;

  @ApiProperty()
  orderId: number;

  @ApiProperty()
  note: string;

  @ApiProperty()
  referenceCode: string;

  @ApiProperty()
  exportDate: Date;

  @ApiProperty()
  createdBy: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
