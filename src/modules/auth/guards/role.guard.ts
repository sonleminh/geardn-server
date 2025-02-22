import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RBAC } from 'src/enums/rbac.enum';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<(keyof RBAC)[]>(
      'roles',
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true; // No role requirement, allow access
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user as {
      email: string;
      name: string;
      userId: string;
      role: (keyof RBAC)[];
    };

    if (!user) {
      throw new UnauthorizedException();
    }

    if (
      user &&
      requiredRoles.some((requiredRole) => user.role?.includes(requiredRole))
    ) {
      return true; // User has the required role, allow access
    }

    throw new ForbiddenException();
  }
}
