import { Request } from 'express';

export function getAccessTokenFromCookies(req: Request) {
  const cookies = req.headers?.cookie;
  return cookies
    ?.split('; ')
    ?.find((cookie) => cookie.startsWith('access_token='))
    ?.split('=')[1];
}