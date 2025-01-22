import { IsNotEmpty, IsString } from 'class-validator';

export enum TAGS {
  // DISCOUNTED = 'Khuyến mãi',
  NEW_ARRIVAL = 'Hàng mới về',
  BEST_SELLER = 'Bán chạy',
  SECONDHAND = 'Hàng 2nd',
}

export class TagsDto {
  @IsNotEmpty()
  @IsString()
  value: string;

  @IsNotEmpty()
  @IsString()
  label: string;
}
