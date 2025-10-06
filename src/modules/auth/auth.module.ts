import { Module, forwardRef } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UserModule } from '../user/user.module';
import { GoogleOAuthService } from './social/google.oauth.service';
import { PrismaModule } from '../prisma/prisma.module';

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
    PrismaModule,
  ],
  providers: [AuthService, GoogleOAuthService, LocalStrategy, JwtStrategy],
  controllers: [AuthController],
  exports: [AuthService, LocalStrategy, JwtStrategy],
})
export class AuthModule {}
