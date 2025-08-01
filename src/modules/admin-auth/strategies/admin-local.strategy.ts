/* eslint-disable prettier/prettier */
import { ForbiddenException, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AdminAuthService } from '../admin-auth.service';
import { UserRole } from '@prisma/client';

@Injectable()
export class LocalAdminStrategy extends PassportStrategy(Strategy, 'admin-local') {
  constructor(private adminAuthService: AdminAuthService) {
    super({ usernameField: 'email' }); 
  }

  async validate(email: string, password: string) {
    const user = await this.adminAuthService.validateUser(email, password);
    if (!user || user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Access denied. Admins only');
    }
    return user;
  }
}