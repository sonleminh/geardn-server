import { ApiProperty } from '@nestjs/swagger';
import { ProductTag } from 'src/common/enums/product-tag.enum';

export class TagDto {
  @ApiProperty({ enum: ProductTag, example: ProductTag.NEW })
  value: ProductTag;

  @ApiProperty({ example: 'Mới' })
  label: string;
}
