import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ImportLogService } from './import-log.service';
import { CreateImportLogDto } from './dto/create-import-log.dto';
import { UpdateImportLogDto } from './dto/update-import-log.dto';

@Controller('import-log')
export class ImportLogController {
  constructor(private readonly importLogService: ImportLogService) {}

  @Post()
  create(@Body() createImportLogDto: CreateImportLogDto) {
    return this.importLogService.create(createImportLogDto);
  }

  @Get()
  findAll() {
    return this.importLogService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.importLogService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateImportLogDto: UpdateImportLogDto) {
    return this.importLogService.update(+id, updateImportLogDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.importLogService.remove(+id);
  }
}
