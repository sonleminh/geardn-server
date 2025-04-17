import { ApiProperty } from '@nestjs/swagger';
import { Cart } from '@prisma/client';

export class CartEntity implements Cart {
  @ApiProperty()
  id: number;

  @ApiProperty()
  userId: number;

  @ApiProperty()
  sessionId: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
