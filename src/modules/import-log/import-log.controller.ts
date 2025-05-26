import { Body, Controller, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { JwtAdminAuthGuard } from '../admin-auth/guards/jwt-auth.guard';
import { CreateImportLogDto } from './dto/create-import-log.dto';
import { FindImportLogsDto } from './dto/find-import-logs.dto';
import { ImportLogService } from './import-log.service';


@UseGuards(JwtAdminAuthGuard)
@Controller('import-logs')
export class ImportLogController {
  constructor(private readonly importLogService: ImportLogService) {}

  @Post()
  create(@Req() req: Request, @Body() createImportLogDto: CreateImportLogDto) {
    const userId = req.user?.id;
    return this.importLogService.create(createImportLogDto, userId);
  }

  @Get()
  findAll(@Query() query: FindImportLogsDto) {
    return this.importLogService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.importLogService.findOne(+id);
  }
}
