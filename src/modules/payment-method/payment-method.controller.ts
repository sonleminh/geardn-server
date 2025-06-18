import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { PaymentMethodService } from './payment-method.service';
import { CreatePaymentMethodDto } from './dto/create-payment-method.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdatePaymentMethodDto } from './dto/update-payment-method.dto';
import { JwtAdminAuthGuard } from '../admin-auth/guards/jwt-admin-auth.guard';
@Controller('payment-methods')
export class PaymentMethodController {
  constructor(private paymentMethodService: PaymentMethodService) {}
  @Post('/')
  @UseGuards(JwtAdminAuthGuard)
  async create(@Body() createPaymentMethodDTO: CreatePaymentMethodDto) {
    return this.paymentMethodService.create(createPaymentMethodDTO);
  }
  @Get()
  async getPaymentMethodList() {
    return this.paymentMethodService.findAll();
  }
  @Get('/:id')
  @HttpCode(HttpStatus.OK)
  async findById(@Param('id') id: string) {
    return await this.paymentMethodService.findOne(+id);
  }
  @Patch(':id')
  @UseGuards(JwtAdminAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async update(@Param('id') id: string, @Body() body: UpdatePaymentMethodDto) {
    return await this.paymentMethodService.update(+id, body);
  }
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async remove(@Param('id') id: string) {
    return await this.paymentMethodService.delete(+id);
  }
}
