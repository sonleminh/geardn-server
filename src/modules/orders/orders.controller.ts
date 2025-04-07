import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Query } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Request } from 'express';
import { JwtAdminAuthGuard } from '../admin-auth/guards/jwt-auth.guard';
import { OrderStatus } from '@prisma/client';

@Controller('orders')
export class OrdersController {
constructor(private readonly ordersService: OrdersService) {}

  @Post()
  async create(@Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(createOrderDto);
  }

  @UseGuards(JwtAdminAuthGuard)
  @Get()
  findAll() {
    return this.ordersService.findAll();
  }

  @Get(':orderCode')
  findOne(@Param('orderCode') orderCode: string) {
    return this.ordersService.findOne(orderCode);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/user')
  getOrdersByUser(@Req() req: Request) {
    const userId = req.user?.id;
    return this.ordersService.getOrdersByUser(userId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.ordersService.update(+id, updateOrderDto);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() status: { status: OrderStatus },
  ) {
    return this.ordersService.updateStatus(+id, status);
  }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.ordersService.remove(+id);
  // }
}
