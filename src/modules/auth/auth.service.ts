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
      const { accessToken, refreshToken } = await this.generaTokens({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      });

      this.storeToken(res, 'at', accessToken, 2);
      this.storeToken(res, 'rt', refreshToken, 48);

      const { password, ...tempUser } = user;
      return tempUser;
    } catch (error) {
      throw error;
    }
  }

  async logout(req: expressRequest, res: Response) {
    res.clearCookie('at');
    res.clearCookie('rt');
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
          expiresIn: '2d',
        }),
      ]);
      return {
        accessToken: AT,
        refreshToken: RT,
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
      ?.find((tokens) => tokens.startsWith('rt='))
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
      this.storeToken(res, 'at', newAccessToken, 2);

      return {
        accessToken: newAccessToken,
        expires: 2,
      };
    } catch {
      throw new HttpException('Invalid refresh token', HttpStatus.UNAUTHORIZED);
    }
  }
}
