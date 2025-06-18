import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserService } from 'src/modules/user/user.service';
import { UserRole } from '@prisma/client';

@Injectable()
export class JwtAdminStrategy extends PassportStrategy(Strategy, 'admin-jwt') {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        JwtAdminStrategy.extractJWTFromCookie,
      ]),
      secretOrKey: configService.get<string>('JWT_SECRET_KEY'),
    });
  }

  async validate(payload: any) {
    const userResponse = await this.userService.findById(payload?.id);
    const user = userResponse.data;
    
    if (!user) {
      throw new UnauthorizedException('User no longer exists');
    }
    
    if (user.role !== UserRole.ADMIN) {
      throw new UnauthorizedException('Access denied. Admin role required.');
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
