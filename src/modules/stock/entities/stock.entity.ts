import { ApiProperty } from '@nestjs/swagger';
import { Stock } from '@prisma/client';

export class StockEntity implements Stock {
  @ApiProperty()
  id: number;

  @ApiProperty()
  skuId: number;

  @ApiProperty()
  warehouseId: number;

  @ApiProperty()
  quantity: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
