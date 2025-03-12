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
import { RegisterDTO } from './dto/register.dto';
import { UserService } from '../user/user.service';
import { ILoginResponse } from 'src/interfaces/IUser';
import { ITokenPayload } from 'src/interfaces/ITokenPayload';
import { CreateUserDto } from '../user/dto/create-user.dto';
@Injectable()
export class AuthService {
  private ATSecret: string;
  private RTSecret: string;
  private CKPath: string;
  private JwtSecretKey: string;

  constructor(
    private userService: UserService,
    private configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {
    this.ATSecret = this.configService.get('AT_SECRET');
    this.RTSecret = this.configService.get('RT_SECRET');
    this.CKPath = this.configService.get('CK_PATH');
    this.JwtSecretKey = this.configService.get('JWT_SECRET_KEY');
  }

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
        email: user.email,
        name: user.name,
        role: user.role,
      });

      this.storeToken(res, 'access_token', access_token, 60);
      this.storeToken(res, 'refresh_token', refresh_token, 90);

      const { password, ...tempUser } = user;
      return tempUser;
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
          expiresIn: '60s',
        }),
        this.jwtService.signAsync(data, {
          secret: this.configService.get<string>('JWT_SECRET_KEY'),
          expiresIn: '90s',
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
    expires.setSeconds(expires.getSeconds() + expiresInHours);
    // expires.setHours(expires.getHours() + expiresInHours);

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
          expiresIn: '60',
        },
      );
      this.storeToken(res, 'access_token', newAccessToken, 60);

      return {
        access_token: newAccessToken,
        expires: 60,
      };
    } catch {
      throw new HttpException('Invalid refresh token', HttpStatus.UNAUTHORIZED);
    }
  }
}
