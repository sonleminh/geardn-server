import {
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  Request,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Request as expressRequest, Response } from 'express';
import { UserService } from '../user/user.service';
import { ILoginResponse } from 'src/interfaces/IUser';
import { ITokenPayload } from 'src/interfaces/ITokenPayload';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { PrismaService } from '../prisma/prisma.service';
@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private userService: UserService,
    private configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string) {
    const userData = await this.userService.findAndVerify({
      email,
      password,
    });
    return userData;
  }

  async signUp(registerDTO: CreateUserDto) {
    try {
      return this.userService.createUser(registerDTO);
    } catch (error) {
      throw error;
    }
  }

  async login(user: ILoginResponse, res: Response) {
    try {
      const { access_token, refresh_token } = await this.generaTokens({
        id: user.id,
        role: user.role,
      });

      this.storeToken(res, 'access_token', access_token, 2);
      this.storeToken(res, 'refresh_token', refresh_token, 48);
      return user;
    } catch (error) {
      throw error;
    }
  }

  async logout(req: expressRequest, res: Response) {
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');
    res.clearCookie('GC');
    return { message: 'Logout successful!' };
  }

  async generaTokens(data: ITokenPayload) {
    try {
      const [AT, RT] = await Promise.all([
        this.jwtService.signAsync(data, {
          secret: this.configService.get<string>('JWT_SECRET_KEY'),
          expiresIn: '2h',
        }),
        this.jwtService.signAsync(data, {
          secret: this.configService.get<string>('JWT_SECRET_KEY'),
          expiresIn: '48h',
        }),
      ]);
      return {
        access_token: AT,
        refresh_token: RT,
      };
    } catch {
      throw new InternalServerErrorException();
    }
  }

  storeToken(
    res: Response,
    tokenName: string,
    token: string,
    expiresInHours: number,
  ) {
    const expires = new Date();
    expires.setHours(expires.getHours() + expiresInHours);

    res.cookie(tokenName, token, {
      // sameSite: 'none',
      // httpOnly: true,
      // secure: true,
      expires: expires,
      path: '/',
    });
  }

  async refreshToken(@Request() req: expressRequest, res: Response) {
    const tokens = req.headers.cookie;
    if (!tokens) {
      throw new HttpException(
        'Refresh token is required',
        HttpStatus.BAD_REQUEST,
      );
    }
    const refreshToken = tokens
      ?.split('; ')
      ?.find((tokens) => tokens.startsWith('refresh_token='))
      ?.split('=')[1];
    // if (!refreshToken) {
    //   throw new HttpException(
    //     'Refresh token has expired or does not exist',
    //     HttpStatus.BAD_REQUEST,
    //   );
    // }
    try {
      const payload = await this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_SECRET_KEY'),
      });
      const { id, email, name, role, ...rest } = payload;
      const newAccessToken = await this.jwtService.signAsync(
        { id, email, name, role },
        {
          secret: this.configService.get<string>('JWT_SECRET_KEY'),
          expiresIn: '2h',
        },
      );
      this.storeToken(res, 'access_token', newAccessToken, 2);

      return {
        access_token: newAccessToken,
      };
    } catch {
      throw new HttpException('Invalid refresh token', HttpStatus.UNAUTHORIZED);
    }
  }

  async getProfile(user: { id: number; role: string }) {
    const me = await this.prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        provider: true,
      },
    });
    return { message: 'OK', data: me };
  }
}
