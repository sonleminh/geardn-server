import { ApiProperty } from '@nestjs/swagger';
import { JsonObject } from '@prisma/client/runtime/library';
import {
  IsArray,
  IsNumber,
  IsInt,
  IsObject,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { CreateOrderItemDto } from './create-order-item.dto';
export class CreateOrderDto {
  @ApiProperty({ required: false })
  @IsOptional()
  userId?: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsInt()
  paymentMethodId: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  totalPrice: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  fullName: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  note?: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsObject()
  shipment: JsonObject;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  flag?: JsonObject;

  @ApiProperty({ type: [CreateOrderItemDto] })
  @IsNotEmpty()
  @IsArray()
  orderItems: CreateOrderItemDto[];

  @ApiProperty({ required: false })
  @IsOptional()
  completedAt?: Date;
}
