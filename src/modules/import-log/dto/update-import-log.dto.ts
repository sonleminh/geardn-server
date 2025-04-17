import { PartialType } from '@nestjs/swagger';
import { CreateImportLogDto } from './create-import-log.dto';

export class UpdateImportLogDto extends PartialType(CreateImportLogDto) {}
