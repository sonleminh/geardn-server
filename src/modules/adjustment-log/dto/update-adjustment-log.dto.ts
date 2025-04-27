import { PartialType } from '@nestjs/swagger';
import { CreateAdjustmentLogDto } from './create-adjustment-log.dto';

export class UpdateExportLogDto extends PartialType(CreateAdjustmentLogDto) {}
