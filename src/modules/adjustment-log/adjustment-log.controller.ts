import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import { AdjustmentLogService } from './adjustment-log.service';
import { CreateAdjustmentLogDto } from './dto/create-adjustment-log.dto';
import { JwtAdminAuthGuard } from '../admin-auth/guards/jwt-admin-auth.guard';
import { Request } from 'express';
import { FindAdjustmentLogsDto } from './dto/find-adjustment-logs.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('adjustment-logs')
@Controller('adjustment-logs')
export class AdjustmentLogController {
  constructor(private readonly adjustmentLogService: AdjustmentLogService) {}

  @UseGuards(JwtAdminAuthGuard)
  @Post()
  create(@Req() req: Request, @Body() dto: CreateAdjustmentLogDto) {
    const userId = req.user?.id;
    return this.adjustmentLogService.create(dto, userId);
  }

  @Get()
  findAll(@Query() dto: FindAdjustmentLogsDto) {
    return this.adjustmentLogService.findAll(dto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.adjustmentLogService.findOne(+id);
  }
}
