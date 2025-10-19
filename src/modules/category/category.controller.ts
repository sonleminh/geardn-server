import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { ApiCreatedResponse, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CategoryEntity } from './entities/category.entity';
import { JwtAdminAuthGuard } from '../admin-auth/guards/jwt-admin-auth.guard';

@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  @ApiCreatedResponse({ type: CategoryEntity })
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoryService.create(createCategoryDto);
  }

  @Get()
  findAll() {
    return this.categoryService.findAll();
  }

  @UseGuards(JwtAdminAuthGuard)
  @Get('admin')
  @ApiOperation({ summary: 'Get categories for admin dashboard' })
  @ApiResponse({
    status: 200,
    description: 'Categories retrieved successfully',
    type: [CategoryEntity],
  })
  async adminFindAll() {
    return this.categoryService.adminFindAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.categoryService.findOne(+id);
  }

  @Get('slug/:slug')
  @ApiCreatedResponse({ type: CategoryEntity })
  getProductBySlug(@Param('slug') slug: string) {
    return this.categoryService.findOneBySlug(slug);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoryService.update(+id, updateCategoryDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.categoryService.softDelete(+id);
  }

  @UseGuards(JwtAdminAuthGuard)
  @Patch(':id/restore')
  @ApiCreatedResponse({ type: CategoryEntity })
  restore(@Param('id') id: string) {
    return this.categoryService.restore(+id);
  }

  @UseGuards(JwtAdminAuthGuard)
  @Delete(':id/permanent')
  @ApiCreatedResponse({ type: CategoryEntity })
  forceDelete(@Param('id') id: string) {
    return this.categoryService.forceDelete(+id);
  }
}
