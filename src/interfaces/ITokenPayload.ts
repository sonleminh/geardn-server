import { User } from "@prisma/client";

export interface ITokenPayload extends Pick<User, 'email'> {
  id: number;
  name: string;
  role: string;
}
