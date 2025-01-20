import { Module, forwardRef } from '@nestjs/common';
import { AdminAuthService } from './admin-auth.service';
import { AdminAuthController } from './admin-auth.controller';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LocalStrategy } from './strategies/admin-local.strategy';
import { JwtStrategy } from './strategies/admin-jwt.strategy';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    forwardRef(() => UserModule),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET_KEY'),
        signOptions: { expiresIn: '86400s' },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [AdminAuthService, LocalStrategy, JwtStrategy],
  controllers: [AdminAuthController],
  exports: [AdminAuthService, LocalStrategy, JwtStrategy],
})
export class AdminAuthModule {}
