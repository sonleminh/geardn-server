import { UserRole } from '@prisma/client';

export interface ITokenPayload {
  id: number;
  role: UserRole;
}
