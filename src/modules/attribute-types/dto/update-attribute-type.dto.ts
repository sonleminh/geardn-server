import { PartialType } from '@nestjs/swagger';
import { CreateAttributeTypeDto } from './create-attribute-type.dto';

export class UpdateAttributeTypeDto extends PartialType(
  CreateAttributeTypeDto,
) {}
