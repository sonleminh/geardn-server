import { IsNotEmpty, IsString } from 'class-validator';

export enum TAGS {
  // DISCOUNTED = 'Khuyến mãi',
  NEW_ARRIVAL = 'Hàng mới về',
  BEST_SELLER = 'Bán chạy',
  SECONDHAND = 'Hàng 2nd',
}

export class TagDto {
  @IsString()
  @IsNotEmpty()
  value: string;

  @IsString()
  @IsNotEmpty()
  label: string;
}
