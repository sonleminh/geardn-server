import { ApiProperty } from '@nestjs/swagger';
import { Warehouse } from '@prisma/client';

export class WarehouseEntity implements Warehouse {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  address: string;

  @ApiProperty({ required: true })
  isDeleted: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
