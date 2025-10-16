import { Type, Transform } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';

const SORT_BY = ['createdAt', 'price', 'sold'] as const;
type SortBy = (typeof SORT_BY)[number];

export class BaseQueryDto {
  /** asc|desc. Hỗ trợ alias: order */
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  @Transform(({ obj, value }) => obj.order ?? value ?? 'desc')
  order: 'asc' | 'desc' = 'desc';

  /** field sắp xếp. Hỗ trợ alias: sortBy (Shopee) */
  @IsOptional()
  @Transform(({ obj, value }) => obj.sortBy ?? value ?? 'createdAt')
  sortBy?: SortBy = 'createdAt';

  /** page 1-based nội bộ. Hỗ trợ Shopee page=0-based */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Transform(({ value }) => {
    // Cho phép client gửi 0-based: 0 -> 1, 1 -> 2, ...
    const n = Number(value);
    if (Number.isNaN(n)) return 1;
    return n >= 1 ? n : n + 1; // nếu 0 thì +1
  })
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 12;
}
