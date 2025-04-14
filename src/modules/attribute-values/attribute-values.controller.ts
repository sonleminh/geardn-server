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
import { CreateAttributeValueDto } from './dto/create-attribute-values.dto';
import { UpdateAttributeValueDto } from './dto/update-attribute-values.dto';
import { AttributeValuesService } from './attribute-values.service';
import { JwtAdminAuthGuard } from '../admin-auth/guards/jwt-auth.guard';

@Controller('attribute-values')
export class AttributeValuesController {
  constructor(
    private readonly attributeValuesService: AttributeValuesService,
  ) {}

  @Post()
  create(@Body() createProductAttributeDto: CreateAttributeValueDto) {
    return this.attributeValuesService.create(createProductAttributeDto);
  }

  // @UseGuards(JwtAdminAuthGuard)
  @Get()
  findAll() {
    return this.attributeValuesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.attributeValuesService.findOne(+id);
  }

  @Get('attribute/:id')
  findByAttributeId(@Param('id') attributeId: string) {
    return this.attributeValuesService.findByAttributeId(+attributeId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateProductAttributeDto: UpdateAttributeValueDto,
  ) {
    return this.attributeValuesService.update(+id, updateProductAttributeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.attributeValuesService.remove(+id);
  }
}
