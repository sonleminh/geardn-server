import { IsArray, IsInt, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class SkuWarehouseMappingDto {
  @IsInt()
  skuId: number;

  @IsInt()
  warehouseId: number;
}

export class ConfirmShipmentDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SkuWarehouseMappingDto)
  skuWarehouseMapping: SkuWarehouseMappingDto[];
} 