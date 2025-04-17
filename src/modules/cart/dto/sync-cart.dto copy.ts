import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class SyncCartItemsDto {
  @ApiProperty()
  @IsNotEmpty()
  productId: number;

  @ApiProperty()
  @IsNotEmpty()
  skuId: number;

  @ApiProperty()
  @IsNotEmpty()
  quantity: number;
}
