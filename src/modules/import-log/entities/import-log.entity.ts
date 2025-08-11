import { ApiProperty } from '@nestjs/swagger';
import { ImportLog, ImportType } from '@prisma/client';

export class ImportLogEntity implements ImportLog {
  @ApiProperty()
  id: number;

  @ApiProperty()
  warehouseId: number;

  @ApiProperty()
  type: ImportType;

  @ApiProperty()
  orderId: number;

  @ApiProperty()
  note: string;

  @ApiProperty()
  referenceCode: string;

  @ApiProperty()
  importDate: Date;

  @ApiProperty()
  createdBy: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
