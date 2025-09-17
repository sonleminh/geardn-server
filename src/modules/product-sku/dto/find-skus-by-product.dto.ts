import { IsEnum, IsOptional } from 'class-validator';

export enum RecordState {
  ACTIVE = 'active',
  DELETED = 'deleted',
  ALL = 'all',
}

export class FindSkusByProductDto {
  @IsOptional()
  @IsEnum(RecordState)
  state?: RecordState = RecordState.ACTIVE;
}
