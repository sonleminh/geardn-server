import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { WarehouseService } from './warehouse.service';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto';
import { ApiCreatedResponse } from '@nestjs/swagger';

@Controller('warehouses')
export class WarehouseController {
  constructor(private readonly warehousesService: WarehouseService) {}

  @Post()
  create(@Body() createWarehouseDto: CreateWarehouseDto) {
    return this.warehousesService.create(createWarehouseDto);
  }

  @Get()
  findAll() {
    return this.warehousesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.warehousesService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateWarehouseDto: UpdateWarehouseDto,
  ) {
    return this.warehousesService.update(+id, updateWarehouseDto);
  }

  @Patch(':id/soft-delete')
  softDelete(@Param('id') id: string) {
    return this.warehousesService.softDelete(+id);
  }

  @Patch(':id/restore')
  restore(@Param('id') id: string) {
    return this.warehousesService.restore(+id);
  }
}
