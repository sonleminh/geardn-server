import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  Res,
  UseGuards
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDTO } from './dto/register.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { UserService } from '../user/user.service';
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}
  @Post('signup')
  async signUp(@Body() registerDTO: RegisterDTO) {
    return this.authService.signUp(registerDTO);
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req, @Res({ passthrough: true }) res) {
    return this.authService.login(req.user, res);
  }

  @Post('logout')
  async logout(@Request() req, @Res({ passthrough: true }) res) {
    return this.authService.logout(req, res);
  }

  @UseGuards(JwtAuthGuard)
  @Get('whoami')
  async getProfile(@Request() req) {
    return req.user;
  }

  @Get('refresh-token')
  async refresh(@Request() req, @Res({ passthrough: true }) res) {
    return this.authService.refreshToken(req, res);
  }
}
