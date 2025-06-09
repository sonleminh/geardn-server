import { Type } from 'class-transformer';
import {
  IsArray,
  IsEmail,
  IsInt,
  IsJSON,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
// import { UpdateOrderItemDto } from './update-order-item.dto';
import { JsonObject } from '@prisma/client/runtime/library';

export class UpdateOrderItemDto {
  @IsInt()
  skuId: number;

  @IsInt()
  productId: number;

  @IsInt()
  quantity: number;

  @IsInt()
  price: number;

  @IsInt()
  imageUrl: string;

  @IsString()
  productName: string;

  @IsString()
  productSlug: string;

  @IsString()
  skuCode: string;

  @IsJSON()
  skuAttributes: JsonObject;
}

export class UpdateOrderDto {
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  note?: string;

  @IsObject()
  @IsOptional()
  flag?: Record<string, any>;

  @IsObject()
  @IsOptional()
  shipment?: Record<string, any>;

  @IsNumber()
  @IsNotEmpty()
  paymentMethodId: number;

  @IsNumber()
  @IsNotEmpty()
  totalPrice: number;

  @IsNotEmpty()
  @IsArray()
//   @ValidateNested({ each: true })
//   @Type(() => UpdateOrderItemDto)
  orderItems: UpdateOrderItemDto[];
}
