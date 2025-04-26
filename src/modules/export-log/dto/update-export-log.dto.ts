import { PartialType } from '@nestjs/swagger';
import { CreateExportLogDto } from './create-export-log.dto';

export class UpdateExportLogDto extends PartialType(CreateExportLogDto) {}
