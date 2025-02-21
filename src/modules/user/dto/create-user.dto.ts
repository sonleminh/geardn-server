import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreateUserDto {
  @ApiProperty()
  @IsNotEmpty()
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  password: string;

  @ApiProperty()
  @IsNotEmpty()
  name: string;
}
