// import { Transform, TransformFnParams } from 'class-transformer';
// import { IsEmail, IsLowercase, IsNotEmpty, IsString, Length } from 'class-validator';


// export class RegisterDTO {
//   @IsString()
//   @IsNotEmpty()
//   @Transform(({ value }: TransformFnParams) => value?.trim())
//   @Length(5, 26)
//   @IsLowercase()
//   name: string;

//   @IsNotEmpty()
//   @IsEmail()
//   @Transform(({ value }: TransformFnParams) => value?.trim())
//   email: string;

//   @IsString()
//   @IsNotEmpty()
//   @Transform(({ value }: TransformFnParams) => value?.trim())
//   password: string;

//   @IsString()
//   @Transform(({ value }: TransformFnParams) => value?.trim())
//   role: string;
// }
