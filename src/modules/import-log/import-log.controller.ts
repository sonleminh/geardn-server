import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { ImportLogService } from './import-log.service';
import { CreateImportLogDto } from './dto/create-import-log.dto';
import { UpdateImportLogDto } from './dto/update-import-log.dto';
import { JwtAdminAuthGuard } from '../admin-auth/guards/jwt-auth.guard';
import { Request } from 'express';

@Controller('import-logs')
export class ImportLogController {
  constructor(private readonly importLogService: ImportLogService) {}

  @UseGuards(JwtAdminAuthGuard)
  @Post()
  create(@Req() req: Request, @Body() createImportLogDto: CreateImportLogDto) {
    const userId = req.user?.id;
    return this.importLogService.create(createImportLogDto, userId);
  }

  @Get()
  findAll() {
    return this.importLogService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.importLogService.findOne(+id);
  }
}
