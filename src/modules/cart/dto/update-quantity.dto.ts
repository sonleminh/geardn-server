import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class UpdateQuantityDto {
  @ApiProperty()
  @IsNotEmpty()
  quantity: number;
}