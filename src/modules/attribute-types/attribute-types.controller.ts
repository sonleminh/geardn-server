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
import { JwtAdminAuthGuard } from '../admin-auth/guards/jwt-auth.guard';
import { AttributeTypesService } from './attribute-types.service';
import { CreateAttributeTypeDto } from './dto/create-attribute-type.dto';
import { UpdateAttributeTypeDto } from './dto/update-attribute-type.dto';

@Controller('attribute-types')
export class AttributeTypesController {
  constructor(private readonly attributeTypesService: AttributeTypesService) {}

  @Post()
  create(@Body() createAttributeTypeDto: CreateAttributeTypeDto) {
    return this.attributeTypesService.create(createAttributeTypeDto);
  }

  // @UseGuards(JwtAdminAuthGuard)
  @Get()
  findAll() {
    return this.attributeTypesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.attributeTypesService.findOne(+id);
  }

  // @Get('type/:id')
  // findByType(@Param('id') type: string) {
  //   return this.attributeTypesService.findByType(type);
  // }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateAttributeTypeDto: UpdateAttributeTypeDto,
  ) {
    return this.attributeTypesService.update(+id, updateAttributeTypeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.attributeTypesService.remove(+id);
  }
}
