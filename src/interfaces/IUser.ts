import { UserRole } from "@prisma/client";

export interface ILoginResponse {
  id: number;
  email: string;
  name: string;
  role: UserRole;
}