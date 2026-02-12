import { Controller, Post, Get, Delete, Body, Param, UseGuards, Request, BadRequestException } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { AuthGuard } from '../auth/auth.guard';
import { PermissionsGuard, RequirePermission } from '../permissions/permissions.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ProcessCardPaymentDto } from './dto/process-card-payment.dto';

@ApiTags('payment')
@ApiBearerAuth()
@Controller('payments')
@UseGuards(AuthGuard, PermissionsGuard)
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) { }

  @Post('card')
  @RequirePermission('order:manage', 'cart:manage')
  @ApiOperation({ summary: 'Processar pagamento por cartão de crédito/débito' })
  async createCardPayment(@Body() dto: ProcessCardPaymentDto, @Request() req) {
    const order = await this.paymentService.getOrderData(dto.orderId);

    if (!order) {
      throw new BadRequestException('Pedido não encontrado');
    }

    const requesterId = Number(req.user.sub || req.user.id);
    const canManageOrders = req.user.permissions?.includes('order:manage');

    if (order.user.id !== requesterId && !canManageOrders) {
      throw new BadRequestException('Você não tem permissão para pagar este pedido');
    }

    return this.paymentService.createCardPayment({
      id: order.id,
      total: order.total,
      user: {
        id: order.user.id,
        email: order.user.email,
        name: order.user.name || 'Cliente',
        cpf: order.user.cpf?.replace(/\D/g, '') || '',
      },
      token: dto.token,
      cardId: dto.cardId,
      saveCard: dto.saveCard,
      installments: dto.installments || 1,
      paymentMethodId: dto.paymentMethodId || 'credit_card',
    });
  }

  @Get('cards')
  @RequirePermission('cart:manage')
  @ApiOperation({ summary: 'Listar cartões salvos do usuário' })
  async listCards(@Request() req) {
    const userId = Number(req.user.sub || req.user.id);
    return this.paymentService.listSavedCards(userId);
  }

  @Delete('cards/:id')
  @RequirePermission('cart:manage')
  @ApiOperation({ summary: 'Remover um cartão salvo' })
  async removeCard(@Param('id') id: string, @Request() req) {
    const userId = Number(req.user.sub || req.user.id);
    return this.paymentService.removeSavedCard(userId, id);
  }
}
