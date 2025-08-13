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
import { OrderReasonCode } from 'src/common/enums/order-reason-code';
import { FindOrderStatusHistoryDto } from './dto/find-order-status-history.dto';
import { FindOrdersDto } from './dto/find-orders.dto';
import { FindOrdersReturnRequestDto } from './dto/find-orders-return-request.dto';
import { OrderStatus } from 'src/common/enums/order-status.enum';
import { ReturnStatus } from '@prisma/client';

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

  // @UseGuards(JwtAuthGuard)
  // @Get('user-purchases')
  // getUserPurchases(@Req() req: Request, @Query('type') type: string) {
  //   const userId = req.user?.id;
  //   return this.orderService.getUserPurchases(userId, +type);
  // }

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
      note,
    }: {
      oldStatus: OrderStatus;
      newStatus: OrderStatus;
      note: string;
    },
    @Req() req: Request,
  ) {
    const userId = req.user?.id;
    return this.orderService.updateStatus(
      +id,
      { oldStatus, newStatus },
      userId,
      note,
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

  @UseGuards(JwtAdminAuthGuard)
  @Patch('return-requests/:id/status')
  updateReturnStatus(
    @Param('id') id: string,
    @Body()
    {
      oldStatus,
      newStatus,
      // note,
    }: {
      oldStatus: ReturnStatus;
      newStatus: ReturnStatus;
      // note: string;
    },
    // @Req() req: Request,
  ) {
    // const userId = req.user?.id;
    return this.orderService.updateReturnStatus(
      +id,
      { oldStatus, newStatus },
      // userId,
      // note,
    );
  }

  @UseGuards(JwtAdminAuthGuard)
  @Patch(':id/confirm-return')
  completeReturnRequest(
    @Param('id') id: string,
    @Body() confirmShipmentDto: ConfirmShipmentDto,
    @Req() req: Request,
  ) {
    const userId = req.user?.id;
    return this.orderService.completeReturnRequest(
      +id,
      confirmShipmentDto.skuWarehouseMapping,
      userId,
    );
  }

  @UseGuards(JwtAdminAuthGuard)
  @Patch(':id/cancel')
  cancelOrder(
    @Param('id') id: string,
    @Body()
    {
      oldStatus,
      cancelReasonCode,
      cancelReason,
    }: {
      oldStatus: OrderStatus;
      cancelReasonCode: OrderReasonCode;
      cancelReason: string;
    },
    @Req() req: Request,
  ) {
    const userId = req.user?.id;
    return this.orderService.cancelOrder(
      +id,
      userId,
      oldStatus,
      cancelReasonCode,
      cancelReason,
    );
  }

  @UseGuards(JwtAdminAuthGuard)
  @Patch(':id/delivery-failed')
  updateDeliveryFailed(
    @Param('id') id: string,
    @Body()
    {
      oldStatus,
      reasonCode,
      reasonNote,
    }: {
      oldStatus: OrderStatus;
      reasonCode: OrderReasonCode;
      reasonNote: string;
    },
    @Req() req: Request,
  ) {
    const userId = req.user?.id;
    return this.orderService.updateDeliveryFailed(
      +id,
      userId,
      oldStatus,
      reasonCode,
      reasonNote,
    );
  }
}
