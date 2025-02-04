import { IsInt } from 'class-validator';

export class CreateProductSKUAttributeDto {
  @IsInt()
  attributeId: number;
}
