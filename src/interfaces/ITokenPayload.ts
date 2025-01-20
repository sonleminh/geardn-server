import { User } from "@prisma/client";

export interface ITokenPayload extends Pick<User, 'email'> {
  _id: number;
  name: string;
  role: string;
}
