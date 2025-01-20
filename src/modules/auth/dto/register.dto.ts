import { Transform, TransformFnParams } from 'class-transformer';
import {
  IsEmail,
  IsLowercase,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  MinLength,
} from 'class-validator';

export class RegisterDTO {
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @Length(5, 26)
  @IsLowercase()
  name: string;

  @IsNotEmpty()
  @IsEmail()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @MinLength(7)
  email: string;

  @IsString()
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @MinLength(5)
  password: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  role: string;
}
