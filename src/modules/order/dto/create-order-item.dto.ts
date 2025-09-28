import { ApiProperty } from '@nestjs/swagger';
import { Decimal } from '@prisma/client/runtime/library';
import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';

class SkuAttributeDto {
  @IsString()
  attribute: string;

  @IsString()
  value: string;
}

export class CreateOrderItemDto {
  @ApiProperty()
  @IsNotEmpty()
  skuId: number;

  // @ApiProperty()
  // skuCode: string;

  // @ApiProperty()
  // productId: number;

  // @ApiProperty()
  // productName: string;

  // @ApiProperty()
  // productSlug: string;

  // @ApiProperty()
  // imageUrl: string;

  @ApiProperty()
  quantity: number;

  // @ApiProperty()
  // sellingPrice: number;

  // @ApiProperty()
  // @IsOptional()
  // unitCost?: number;

  // @ApiProperty()
  // @IsArray()
  // @ValidateNested({ each: true })
  // @Type(() => SkuAttributeDto)
  // skuAttributes: SkuAttributeDto[];

  // @ApiProperty()
  // @IsOptional()
  // orderId?: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}