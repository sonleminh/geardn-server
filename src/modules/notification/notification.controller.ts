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
import { ListNotificationsDto } from './dto/list-notifications.dto';

// admin-notifications.controller.ts
@UseGuards(JwtAdminAuthGuard)

@Controller('admin/notifications')
export class AdminNotificationsController {
  constructor(private readonly svc: NotificationsService) {}

  @Get('')
  getNotifications(@Query() q: ListNotificationsDto, @Req() req) {
    return this.svc.getNotifications(req.user.id, q);
  }

  @Get('unread-count')
  unread(@Req() req) {
    return this.svc.unreadCount(req.user.id);
  }

  @Patch('mark-all-read')
  markAllRead(@Req() req, @Body() body: { before: string }) {
    return this.svc.markAllRead(req.user.id, body.before);
  }
}
