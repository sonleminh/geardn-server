import { ApiProperty } from '@nestjs/swagger';
import { Stock } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

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
  costPrice: Decimal;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
