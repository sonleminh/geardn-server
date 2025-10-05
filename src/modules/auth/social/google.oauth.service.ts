// auth/google.oauth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';
import { AuthService } from '../auth.service';

@Injectable()
export class GoogleOAuthService {
  private client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  async verifyIdToken(idToken: string) {
    try {
      const ticket = await this.client.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID!,
      });
      const payload = ticket.getPayload();
      if (!payload?.sub || !payload.email) {
        throw new UnauthorizedException('Invalid Google token');
      }
      return {
        googleId: payload.sub,
        email: payload.email,
        name: payload.name ?? '',
        avatarUrl: payload.picture ?? '',
        emailVerified: !!payload.email_verified,
      };
    } catch {
      throw new UnauthorizedException('Invalid Google token');
    }
  }
}
