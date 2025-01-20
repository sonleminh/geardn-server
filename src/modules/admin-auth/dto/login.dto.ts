// import { Transform, TransformFnParams } from 'class-transformer';
// import {
//   IsLowercase,
//   IsNotEmpty,
//   IsString,
//   Length,
//   MinLength,
// } from 'class-validator';

// export class LoginDTO {
//   @IsString()
//   @IsNotEmpty()
//   @Transform(({ value }: TransformFnParams) => value?.trim())
//   @Length(5, 26)
//   @IsLowercase()
//   username: string;

//   @IsString()
//   @IsNotEmpty()
//   @Transform(({ value }: TransformFnParams) => value?.trim())
//   @MinLength(5)
//   password: string;
// }
