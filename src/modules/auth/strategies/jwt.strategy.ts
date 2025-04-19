import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserService } from 'src/modules/user/user.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        JwtStrategy.extractJWTFromCookie,
      ]),
      secretOrKey: configService.get<string>('JWT_SECRET_KEY'),
    });
  }

  async validate(payload: any) {
    const user = await this.userService.findById(payload?.id);
    if (!user) {
      throw new UnauthorizedException('User no longer exists');
    }
    return payload;
  }

  private static extractJWTFromCookie(req: Request): string | null {
    const cookies = req.headers?.cookie;
    // Make sure there are cookies in the request
    if (!cookies) {
      return null;
    }
    // Parse the cookies
    const jwtCookie = cookies
      .split('; ')
      .find((cookie) => cookie.startsWith('access_token='));

    // If no JWT cookie is found, return null
    if (!jwtCookie) {
      return null;
    }

    // Return only the JWT token value (after 'jwt=')
    return jwtCookie.split('=')[1];
  }
}
