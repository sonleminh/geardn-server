import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty } from 'class-validator';

export class CreateProductDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  categoryId: number;

  @ApiProperty()
  @IsArray({ message: 'Images must be an array.' })
  @IsNotEmpty()
  images: string[];

  @ApiProperty()
  @IsArray()
  tags: string;

  @ApiProperty({ required: false })
  description?: string;
}
