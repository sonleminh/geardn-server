import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class UpdateQuantityDto {
  @ApiProperty()
  @IsNotEmpty()
  skuId: number;

  @ApiProperty()
  @IsNotEmpty()
  quantity: number;
}