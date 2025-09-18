import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  Req,
  UseGuards
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAdminAuthGuard } from '../admin-auth/guards/jwt-admin-auth.guard';
import { FindOrdersReturnRequestDto } from './dto/find-orders-return-request.dto';
import { OrderReturnRequestService } from './order-return-request.service';
import { CompleteReturnRequestDto } from './dto/confirm-complete.dto';
import { ReturnStatus } from '@prisma/client';

@Controller('order-return-requests')
export class OrderReturnRequestController {
  constructor(
    private readonly orderReturnRequestService: OrderReturnRequestService,
  ) {}

  @UseGuards(JwtAdminAuthGuard)
  @Get()
  findAll(@Query() dto: FindOrdersReturnRequestDto) {
    return this.orderReturnRequestService.findAll(dto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.orderReturnRequestService.findOne(+id);
  }

  @UseGuards(JwtAdminAuthGuard)
  @Patch(':id/status')
  updateStatus(
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
    @Req() req: Request,
  ) {
    const userId = req.user?.id;
    return this.orderReturnRequestService.updateStatus(
      +id,
      { oldStatus, newStatus },
      userId,
      // note,
    );
  }

  @UseGuards(JwtAdminAuthGuard)
  @Patch(':id/complete')
  completeReturnRequest(
    @Param('id') id: string,
    @Body() completeReturnRequestDto: CompleteReturnRequestDto,
    @Req() req: Request,
  ) {
    const userId = req.user?.id;
    return this.orderReturnRequestService.completeReturnRequest(
      +id,
      completeReturnRequestDto.skuWarehouseMapping,
      userId,
    );
  }
}
