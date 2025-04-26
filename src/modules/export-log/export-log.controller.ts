import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { ExportLogService } from './export-log.service';
import { CreateExportLogDto } from './dto/create-export-log.dto';
import { UpdateExportLogDto } from './dto/update-export-log.dto';
import { JwtAdminAuthGuard } from '../admin-auth/guards/jwt-auth.guard';
import { Request } from 'express';

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
  findAll() {
    return this.exportLogService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.exportLogService.findOne(+id);
  }
}
