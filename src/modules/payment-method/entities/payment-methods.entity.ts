import { ApiProperty } from '@nestjs/swagger';
import { PaymentMethod } from '@prisma/client';

export class PaymentMethodEntity implements PaymentMethod {
  @ApiProperty()
  id: number;

  @ApiProperty()
  key: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  image: string;

  @ApiProperty()
  isDisabled: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
