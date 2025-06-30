import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAdminAuthGuard } from '../admin-auth/guards/jwt-admin-auth.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { ConfirmShipmentDto } from './dto/confirm-shipment.dto';
import { OrderService } from './order.service';
import { OrderStatus } from '@prisma/client';
import { FindOrdersDto } from './dto/find-orders.dto';
import { FindOrderStatusHistoryDto } from './dto/find-order-status-history.dto';

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  async create(@Body() createOrderDto: CreateOrderDto) {
    return this.orderService.create(createOrderDto);
  }

  @UseGuards(JwtAdminAuthGuard)
  @Get()
  findAll(@Query() query: FindOrdersDto) {
    return this.orderService.findAll(query);
  }

  @UseGuards(JwtAuthGuard)
  @Get('user-purchases')
  getUserPurchases(@Req() req: Request, @Query('type') type: string) {
    const userId = req.user?.id;
    return this.orderService.getUserPurchases(userId, +type);
  }

  @UseGuards(JwtAdminAuthGuard)
  @Get('update-history-logs')
  findOrderStatusHistory(@Query() query: FindOrderStatusHistoryDto) {
    return this.orderService.findOrderStatusHistory(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.orderService.findOne(+id);
  }

  @UseGuards(JwtAdminAuthGuard)
  @Get('admin/:id')
  adminFindOne(@Param('id') id: string) {
    return this.orderService.adminFindOne(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.orderService.update(+id, updateOrderDto);
  }

  @UseGuards(JwtAdminAuthGuard)
  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body()
    {
      oldStatus,
      newStatus,
    }: { oldStatus: OrderStatus; newStatus: OrderStatus },
    @Req() req: Request,
  ) {
    const userId = req.user?.id;
    return this.orderService.updateStatus(
      +id,
      { oldStatus, newStatus },
      userId,
    );
  }

  @UseGuards(JwtAdminAuthGuard)
  @Patch(':id/confirm')
  confirmShipment(
    @Param('id') id: string,
    @Body() confirmShipmentDto: ConfirmShipmentDto,
    @Req() req: Request,
  ) {
    const userId = req.user?.id;
    return this.orderService.confirmShipment(
      +id,
      confirmShipmentDto.skuWarehouseMapping,
      userId,
    );
  }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.orderService.remove(+id);
  // }
}
