import {
  Controller,
  Get,
  Post,
  Request,
  Res,
  UseGuards
} from '@nestjs/common';
import { UserService } from '../user/user.service';
import { AdminAuthService } from './admin-auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAdminAuthGuard } from './guards/jwt-auth.guard';
@Controller('admin/auth')
export class AdminAuthController {
  constructor(
    private readonly adminAuthService: AdminAuthService,
    private readonly userService: UserService,
  ) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req, @Res({ passthrough: true }) res) {
    return this.adminAuthService.login(req.user, res);
  }

  @Post('logout')
  async logout(@Request() req, @Res({ passthrough: true }) res) {
    return this.adminAuthService.logout(req, res);
  }

  @UseGuards(JwtAdminAuthGuard)
  @Get('whoami')
  async getProfile(@Request() req) {
    return req.user;
  }

  @Get('refresh-token')
  async refresh(@Request() req, @Res({ passthrough: true }) res) {
    return this.adminAuthService.refreshToken(req, res);
  }
}
