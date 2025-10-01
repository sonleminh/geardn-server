import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

class SyncCartItemDto {
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
export class SyncCartItemsDto {
  @ApiProperty()
  @IsNotEmpty()
  items: SyncCartItemDto[];
}
