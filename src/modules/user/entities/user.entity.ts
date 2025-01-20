import { ApiProperty } from '@nestjs/swagger';
import { User } from '@prisma/client';

export class UserEntity implements User {

  @ApiProperty()
  id: number;

  @ApiProperty()
  password: string;

  @ApiProperty({ required: true, uniqueItems: true })
  email: string;

  @ApiProperty({ required: true })
  name: string;

  @ApiProperty({ default: 'user' })
  role: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

