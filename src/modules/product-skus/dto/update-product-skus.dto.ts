import { PartialType } from '@nestjs/swagger';
import { CreateProductSkusDto } from './create-product-skus.dto';

export class UpdateProductSkusDto extends PartialType(CreateProductSkusDto) {}
