import { PartialType } from '@nestjs/swagger';
import { CreateAttributeValueDto } from './create-attribute-values.dto';

export class UpdateAttributeValueDto extends PartialType(
  CreateAttributeValueDto,
) {}
