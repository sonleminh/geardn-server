import { ApiProperty } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty()
  name: string;

  @ApiProperty({ required: true })
  icon: string;

  @ApiProperty({ required: true })
  slug: string;
}
