import { Type } from 'class-transformer';
import {
  IsArray,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { UpdateOrderItemDto } from './update-order-item.dto';

export class UpdateOrderDto {
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsString()
  @IsOptional()
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
  @ValidateNested({ each: true })
  @Type(() => UpdateOrderItemDto)
  orderItems: UpdateOrderItemDto[];
}
