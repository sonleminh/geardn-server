import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreateAttributeValueDto {
  @ApiProperty()
  @IsNotEmpty()
  attributeId: number;

  @ApiProperty()
  @IsNotEmpty()
  value: string;
}