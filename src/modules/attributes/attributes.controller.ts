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
import { AttributesService } from './attributes.service';
import { CreateAttributeDto } from './dto/create-attributes.dto';
import { UpdateAttributeDto } from './dto/update-attributes.dto';

@Controller('attributes')
export class AttributesController {
  constructor(private readonly attributesService: AttributesService) {}

  @Post()
  create(@Body() createAttributeDto: CreateAttributeDto) {
    return this.attributesService.create(createAttributeDto);
  }

  // @UseGuards(JwtAdminAuthGuard)
  @Get()
  findAll() {
    return this.attributesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.attributesService.findOne(+id);
  }

  // @Get('type/:id')
  // findByType(@Param('id') type: string) {
  //   return this.attributesService.findByType(type);
  // }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateAttributeDto: UpdateAttributeDto,
  ) {
    return this.attributesService.update(+id, updateAttributeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.attributesService.remove(+id);
  }
}
