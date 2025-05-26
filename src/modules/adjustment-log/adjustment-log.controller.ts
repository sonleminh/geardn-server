import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Query } from '@nestjs/common';
import { AdjustmentLogService } from './adjustment-log.service';
import { CreateAdjustmentLogDto } from './dto/create-adjustment-log.dto';
import { JwtAdminAuthGuard } from '../admin-auth/guards/jwt-auth.guard';
import { Request } from 'express';
import { FindAdjustmentLogsDto } from './dto/find-adjustment-logs.dto';

@Controller('adjustment-logs')
export class AdjustmentLogController {
  constructor(private readonly adjustmentLogService: AdjustmentLogService) {}

  @UseGuards(JwtAdminAuthGuard)
  @Post()
  create(
    @Req() req: Request,
    @Body() createAdjustmentLogDto: CreateAdjustmentLogDto,
  ) {
    const userId = req.user?.id;
    return this.adjustmentLogService.create(createAdjustmentLogDto, userId);
  }

  @Get()
  findAll(@Query() query: FindAdjustmentLogsDto) {
    return this.adjustmentLogService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.adjustmentLogService.findOne(+id);
  }
}
