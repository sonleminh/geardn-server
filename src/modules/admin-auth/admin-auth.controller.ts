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
import { JwtAdminAuthGuard } from './guards/jwt-admin-auth.guard';
import { LocalAdminAuthGuard } from './guards/local-admin-auth.guard';
@Controller('admin/auth')
export class AdminAuthController {
  constructor(
    private readonly adminAuthService: AdminAuthService,
    private readonly userService: UserService,
  ) {}

  @UseGuards(LocalAdminAuthGuard)
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
