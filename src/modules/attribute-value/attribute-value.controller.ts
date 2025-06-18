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

@Controller('attribute-values')
export class AttributeValueController {
  constructor(private readonly attributeValueService: AttributeValueService) {}

  @Post()
  create(@Body() createProductAttributeDto: CreateAttributeValueDto) {
    return this.attributeValueService.create(createProductAttributeDto);
  }

  // @UseGuards(JwtAdminAuthGuard)
  @Get()
  findAll() {
    return this.attributeValueService.findAll();
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

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.attributeValueService.remove(+id);
  }
}
