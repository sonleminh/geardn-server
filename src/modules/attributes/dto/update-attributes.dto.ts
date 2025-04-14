import { PartialType } from '@nestjs/swagger';
import { CreateAttributeDto } from './create-attributes.dto';

export class UpdateAttributeDto extends PartialType(
  CreateAttributeDto,
) {}
