/* eslint-disable prettier/prettier, linebreak-style */
import {
  Get,
  Patch,
  Param,
  Req,
  UseGuards,
  Controller,
  Query,
  Body,
  Post,
} from '@nestjs/common';
import { JwtAdminAuthGuard } from '../admin-auth/guards/jwt-admin-auth.guard';
import { NotificationsService } from './notification.service';
import { GetNotificationsDto } from './dto/get-notifications.dto';

// admin-notifications.controller.ts
@UseGuards(JwtAdminAuthGuard)

@Controller('admin/notifications')
export class AdminNotificationsController {
  constructor(private readonly svc: NotificationsService) {}

  @Get('')
  getNotifications(@Query() q: GetNotificationsDto, @Req() req) {
    return this.svc.getNotifications(req.user.id, q);
  }

  @Get('stats')
  getStats(@Req() req) {
    return this.svc.getStats(req.user.id);
  }

  @Patch('seen')
  seen(@Req() req) {
    return this.svc.markSeen(req.user.id);
  }
}
