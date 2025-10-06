import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDTO } from './dto/register.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { UserService } from '../user/user.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { GoogleOAuthService } from './social/google.oauth.service';
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly google: GoogleOAuthService,
  ) {}
  @Post('signup')
  async signUp(@Body() createProductDto: CreateUserDto) {
    return this.authService.signUp(createProductDto);
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Req() req, @Res({ passthrough: true }) res) {
    return this.authService.login(req.user, res);
  }

  @Post('logout')
  async logout(@Req() req, @Res({ passthrough: true }) res) {
    return this.authService.logout(req, res);
  }

  @UseGuards(JwtAuthGuard)
  @Get('whoami')
  async getProfile(@Req() req) {
    return this.authService.getProfile(req.user);
  }

  @Get('refresh-token')
  async refresh(@Req() req, @Res({ passthrough: true }) res) {
    return this.authService.refreshToken(req, res);
  }

  @Post('google/verify-id-token')
  async verifyGoogle(
    @Body('idToken') idToken: string,
    @Res({ passthrough: true }) res,
  ) {
    const payload = await this.google.verifyIdToken(idToken);
    const user = await this.userService.upsertGoogleUser(payload);

    const { access_token, refresh_token } = await this.authService.generaTokens(
      {
        id: user.id,
        role: user.role,
      },
    );

    this.authService.storeToken(res, 'access_token', access_token, 2);
    this.authService.storeToken(res, 'refresh_token', refresh_token, 2);
    return user;
  }
}
