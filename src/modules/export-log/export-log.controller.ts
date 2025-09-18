import { Body, Controller, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { JwtAdminAuthGuard } from '../admin-auth/guards/jwt-admin-auth.guard';
import { CreateExportLogDto } from './dto/create-export-log.dto';
import { ExportLogService } from './export-log.service';
import { FindExportLogsDto } from './dto/find-export-logs.dto';

@Controller('export-logs')
export class ExportLogController {
  constructor(private readonly exportLogService: ExportLogService) {}

  @UseGuards(JwtAdminAuthGuard)
  @Post()
  create(@Req() req: Request, @Body() createExportLogDto: CreateExportLogDto) {
    const userId = req.user?.id;
    return this.exportLogService.create(createExportLogDto, userId);
  }

  @Get()
  findAll(@Query() dto: FindExportLogsDto) {
    return this.exportLogService.findAll(dto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.exportLogService.findOne(+id);
  }
}
