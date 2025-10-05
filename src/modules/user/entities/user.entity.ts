import { ApiProperty } from '@nestjs/swagger';
import { AuthProvider, User, UserRole } from '@prisma/client';

export class UserEntity implements User {

  @ApiProperty()
  id: number;

  @ApiProperty()
  password: string;

  @ApiProperty({ required: true, uniqueItems: true })
  email: string;

  @ApiProperty({ uniqueItems: true })
  googleId: string;

  @ApiProperty({ required: true })
  name: string;

  @ApiProperty({ default: 'user' })
  role: UserRole;

  @ApiProperty({ default: 'local' })
  provider: AuthProvider;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty()
  lastSeenNotificationsAt: Date | null;

  @ApiProperty()
  lastReadNotificationsAt: Date | null;
}

