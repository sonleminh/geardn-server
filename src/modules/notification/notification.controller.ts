/* eslint-disable prettier/prettier, linebreak-style */
import {
  Get,
  Patch,
  Param,
  Req,
  UseGuards,
  Controller,
  Query,
} from '@nestjs/common';
import { JwtAdminAuthGuard } from '../admin-auth/guards/jwt-admin-auth.guard';
import { NotificationsService } from './notification.service';
import { ListNotificationsDto } from './dto/list-notifications.dto';

// admin-notifications.controller.ts
@UseGuards(JwtAdminAuthGuard)

@Controller('admin/notifications')
export class AdminNotificationsController {
  constructor(private readonly svc: NotificationsService) {}

  @Get()
  list(@Query() q: ListNotificationsDto, @Req() req) {
    return this.svc.listForUser(req.user.id, q);
  }

  @Get('unread-count')
  unread(@Req() req) {
    return this.svc.unreadCount(req.user.id);
  }

  @Patch(':recipientId/read')
  markRead(@Param('recipientId') id: string, @Req() req) {
    return this.svc.markRead(id, req.user.id);
  }
}
