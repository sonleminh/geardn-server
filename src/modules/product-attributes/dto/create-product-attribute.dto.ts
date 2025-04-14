import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreateProductAttributeDto {
  @ApiProperty()
  @IsNotEmpty()
  typeId: number;

  @ApiProperty()
  @IsNotEmpty()
  value: string;
}