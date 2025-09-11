import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAdminAuthGuard } from '../admin-auth/guards/jwt-admin-auth.guard';
import { AttributeService } from './attribute.service';
import { CreateAttributeDto } from './dto/create-attribute.dto';
import { UpdateAttributeDto } from './dto/update-attribute.dto';
import { ApiCreatedResponse } from '@nestjs/swagger';
import { AttributeEntity } from './entities/attribute.entity';

@Controller('attributes')
export class AttributeController {
  constructor(private readonly attributeService: AttributeService) {}

  @Post()
  create(@Body() createAttributeDto: CreateAttributeDto) {
    return this.attributeService.create(createAttributeDto);
  }

  @Get()
  findAll() {
    return this.attributeService.findAll();
  }

  @Get('admin')
  adminFindAll() {
    return this.attributeService.adminFindAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.attributeService.findOne(+id);
  }
  
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateAttributeDto: UpdateAttributeDto,
  ) {
    return this.attributeService.update(+id, updateAttributeDto);
  }

  @UseGuards(JwtAdminAuthGuard)
  @Delete(':id')
  @ApiCreatedResponse({ type: AttributeEntity })
  remove(@Param('id') id: string) {
    return this.attributeService.softDelete(+id);
  }

  @UseGuards(JwtAdminAuthGuard)
  @Patch(':id/restore')
  @ApiCreatedResponse({ type: AttributeEntity })
  restore(@Param('id') id: string) {
    return this.attributeService.restore(+id);
  }

  @UseGuards(JwtAdminAuthGuard)
  @Delete(':id/permanent')
  @ApiCreatedResponse({ type: AttributeEntity })
  forceDelete(@Param('id') id: string) {
    return this.attributeService.forceDelete(+id);
  }
}
