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
import { CreateAttributeValueDto } from './dto/create-attribute-value.dto';
import { UpdateAttributeValueDto } from './dto/update-attribute-value.dto';
import { JwtAdminAuthGuard } from '../admin-auth/guards/jwt-admin-auth.guard';
import { AttributeValueService } from './attribute-value.service';
import { ApiCreatedResponse } from '@nestjs/swagger';
import { AttributeValueEntity } from './entities/attribute-value.entity';

@Controller('attribute-values')
export class AttributeValueController {
  constructor(private readonly attributeValueService: AttributeValueService) {}

  @Post()
  create(@Body() createProductAttributeDto: CreateAttributeValueDto) {
    return this.attributeValueService.create(createProductAttributeDto);
  }

  @Get()
  findAll() {
    return this.attributeValueService.findAll();
  }

  @Get('admin')
  adminFindAll() {
    return this.attributeValueService.adminFindAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.attributeValueService.findOne(+id);
  }

  @Get('attribute/:id')
  findByAttributeId(@Param('id') attributeId: string) {
    return this.attributeValueService.findByAttributeId(+attributeId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateAttributeValueDto: UpdateAttributeValueDto,
  ) {
    return this.attributeValueService.update(+id, updateAttributeValueDto);
  }

  @UseGuards(JwtAdminAuthGuard)
  @Delete(':id')
  @ApiCreatedResponse({ type: AttributeValueEntity })
  remove(@Param('id') id: string) {
    return this.attributeValueService.softDelete(+id);
  }

  @UseGuards(JwtAdminAuthGuard)
  @Patch(':id/restore')
  @ApiCreatedResponse({ type: AttributeValueEntity })
  restore(@Param('id') id: string) {
    return this.attributeValueService.restore(+id);
  }

  @UseGuards(JwtAdminAuthGuard)
  @Delete(':id/permanent')
  @ApiCreatedResponse({ type: AttributeValueEntity })
  forceDelete(@Param('id') id: string) {
    return this.attributeValueService.forceDelete(+id);
  }
}
