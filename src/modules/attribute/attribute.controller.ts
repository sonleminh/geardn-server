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
import { AttributeService } from './attribute.service';
import { CreateAttributeDto } from './dto/create-attribute.dto';
import { UpdateAttributeDto } from './dto/update-attribute.dto';

@Controller('attributes')
export class AttributeController {
  constructor(private readonly attributeService: AttributeService) {}

  @Post()
  create(@Body() createAttributeDto: CreateAttributeDto) {
    return this.attributeService.create(createAttributeDto);
  }

  // @UseGuards(JwtAdminAuthGuard)
  @Get()
  findAll() {
    return this.attributeService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.attributeService.findOne(+id);
  }

  // @Get('type/:id')
  // findByType(@Param('id') type: string) {
  //   return this.attributeService.findByType(type);
  // }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateAttributeDto: UpdateAttributeDto,
  ) {
    return this.attributeService.update(+id, updateAttributeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.attributeService.remove(+id);
  }
}
