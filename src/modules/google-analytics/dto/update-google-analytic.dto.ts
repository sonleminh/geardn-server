import { PartialType } from '@nestjs/swagger';
import { CreateGoogleAnalyticDto } from './create-google-analytic.dto';

export class UpdateGoogleAnalyticDto extends PartialType(CreateGoogleAnalyticDto) {}
