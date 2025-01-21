import { Request } from 'express';

declare module 'express' {
  interface Request {
    user?: { username: string }; // Adjust the type as per your `user` object structure
  }
}