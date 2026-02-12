import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import MercadoPagoConfig, { Payment, Customer, CustomerCard } from 'mercadopago';
import { PrismaService } from 'database/prisma/prisma.service';
import { OrderStatus } from '@prisma/client';

@Injectable()
export class PaymentService {
  private payment: Payment;
  private customer: Customer;
  private customerCard: CustomerCard;
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
  ) {
    const client = new MercadoPagoConfig({
      accessToken: this.config.get<string>('MERCADO_PAGO_ACCESS_TOKEN')!,
    });
    this.payment = new Payment(client);
    this.customer = new Customer(client);
    this.customerCard = new CustomerCard(client);
  }

  async createPixPayment(order: {
    id: string;
    total: number;
    user: { email: string; name: string; cpf: string };
  }) {
    const nameParts = order.user.name.trim().split(' ');
    const firstName = nameParts[0] || 'Cliente';
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : 'OnBack';

    const response = await this.payment.create({
      body: {
        transaction_amount: order.total,
        description: `Pedido ${order.id}`,
        payment_method_id: 'pix',
        payer: {
          email: order.user.email,
          first_name: firstName,
          last_name: lastName,
          identification: {
            type: 'CPF',
            number: order.user.cpf,
          },
        },
        external_reference: order.id,
      },
      requestOptions: { idempotencyKey: `pix-${order.id}` }
    });

    this.logger.log(`PIX Created for Order ${order.id}. Status: ${response.status} (${response.status_detail})`);

    const transactionData = response.point_of_interaction?.transaction_data;

    if (!transactionData) {
      throw new Error('PIX data not returned');
    }

    return {
      paymentId: response.id?.toString(),
      qrCode: transactionData.qr_code,
      qrCodeBase64: transactionData.qr_code_base64,
    };
  }

  async createBoletoPayment(order: {
    id: string;
    total: number;
    user: { email: string; name: string; cpf: string };
    address: {
      zipCode: string;
      street: string;
      number: string;
      neighborhood: string;
      city: string;
      state: string;
    };
  }) {
    const nameParts = order.user.name.trim().split(' ');
    const firstName = nameParts[0] || 'Cliente';
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : 'OnBack';

    const response = await this.payment.create({
      body: {
        transaction_amount: order.total,
        description: `Pedido ${order.id}`,
        payment_method_id: 'bolbradesco',
        payer: {
          email: order.user.email,
          first_name: firstName,
          last_name: lastName,
          identification: {
            type: 'CPF',
            number: order.user.cpf,
          },
          address: {
            zip_code: order.address.zipCode.replace(/\D/g, ''),
            street_name: order.address.street,
            street_number: order.address.number,
            neighborhood: order.address.neighborhood,
            city: order.address.city,
            federal_unit: order.address.state,
          },
        },
        external_reference: order.id,
      },
      requestOptions: { idempotencyKey: `boleto-${order.id}` }
    });

    const transactionData = response.point_of_interaction?.transaction_data;

    return {
      paymentId: response.id?.toString(),
      status: response.status,
      statusDetail: response.status_detail,
      barcode: (transactionData as any)?.barcode?.content,
      ticketUrl: (transactionData as any)?.ticket_url,
    };
  }

  async createCardPayment(order: {
    id: string;
    total: number;
    user: { id: number; email: string; name: string; cpf: string };
    token?: string;
    cardId?: string;
    saveCard?: boolean;
    installments?: number;
    paymentMethodId?: string;
  }) {
    const nameParts = order.user.name.trim().split(' ');
    const firstName = nameParts[0] || 'Cliente';
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : 'OnBack';

    try {
      const customerId = await this.getOrCreateCustomer(order.user.id, order.user.email, order.user.name);

      const response = await this.payment.create({
        body: {
          transaction_amount: order.total,
          description: `Pedido ${order.id} `,
          payment_method_id: order.paymentMethodId || 'credit_card',
          token: order.token,
          installments: order.installments || 1,
          payer: {
            id: customerId,
            email: order.user.email,
            first_name: firstName,
            last_name: lastName,
            identification: {
              type: 'CPF',
              number: order.user.cpf,
            },
          },
          external_reference: order.id,
        },
        requestOptions: { idempotencyKey: `card-${order.id}-${order.token?.slice(-10)}` }
      });

      this.logger.log(`Card Payment Result for Order ${order.id}: Status=${response.status}, Detail=${response.status_detail}, ID=${response.id}`);

      if (response.status === 'approved') {
        await this.markOrderAsPaid(response.id?.toString() || '');

        if (order.saveCard && order.token) {
          await this.customerCard.create({
            customerId,
            body: { token: order.token }
          }).catch(err => console.error('Error saving card:', err));
        }
      }

      return {
        paymentId: response.id?.toString(),
        status: response.status,
        statusDetail: response.status_detail,
        transactionAmount: response.transaction_amount,
      };
    } catch (error: any) {
      const message = error.message || 'Erro ao processar pagamento com cartão';
      throw new BadRequestException(message);
    }
  }

  async getOrCreateCustomer(userId: number, email: string, name: string) {
    const user = await this.prisma.client.user.findUnique({
      where: { id: userId },
      select: { mercadoPagoCustomerId: true }
    });

    if (user?.mercadoPagoCustomerId) {
      return user.mercadoPagoCustomerId;
    }

    const search = await this.customer.search({
      options: { email }
    });

    if (search.results && search.results.length > 0) {
      const customerId = search.results[0].id!;
      await this.prisma.client.user.update({
        where: { id: userId },
        data: { mercadoPagoCustomerId: customerId }
      });
      return customerId;
    }

    const nameParts = name.trim().split(' ');
    const firstName = nameParts[0] || 'Cliente';
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : 'OnBack';

    const response = await this.customer.create({
      body: {
        email,
        first_name: firstName,
        last_name: lastName
      }
    });

    const customerId = response.id!;
    await this.prisma.client.user.update({
      where: { id: userId },
      data: { mercadoPagoCustomerId: customerId }
    });

    return customerId;
  }

  async listSavedCards(userId: number) {
    const user = await this.prisma.client.user.findUnique({
      where: { id: userId },
      select: { mercadoPagoCustomerId: true, email: true, name: true }
    });

    if (!user) return [];

    const customerId = await this.getOrCreateCustomer(userId, user.email, user.name || '');

    const cards = await this.customerCard.list({ customerId });
    return cards.map(c => ({
      id: c.id,
      lastFour: c.last_four_digits,
      expirationMonth: c.expiration_month,
      expirationYear: c.expiration_year,
      paymentMethod: c.payment_method?.id,
      thumbnail: c.payment_method?.thumbnail
    }));
  }

  async removeSavedCard(userId: number, cardId: string) {
    const user = await this.prisma.client.user.findUnique({
      where: { id: userId },
      select: { mercadoPagoCustomerId: true }
    });

    if (!user?.mercadoPagoCustomerId) {
      throw new BadRequestException('Usuário não possui conta no Mercado Pago');
    }

    return this.customerCard.remove({
      customerId: user.mercadoPagoCustomerId,
      cardId
    });
  }

  async getOrderData(orderId: string) {
    const order = await this.prisma.client.order.findUnique({
      where: { id: orderId },
      include: {
        user: {
          select: {
            email: true,
            name: true,
            cpf: true,
          },
        },
      },
    });

    if (!order) {
      return null;
    }

    return {
      id: order.id,
      total: parseFloat(order.total.toNumber().toFixed(2)),
      user: {
        id: order.userId,
        ...order.user
      },
    };
  }

  async markOrderAsPaid(paymentId: string) {
    let payment;
    try {
      payment = await this.payment.get({ id: paymentId });
    } catch (err) {
      return;
    }

    const orderId = payment.external_reference;
    if (!orderId) return;

    const order = await this.prisma.client.order.findUnique({
      where: { id: orderId },
    });

    if (!order || order.status === OrderStatus.PAID) return;

    if (payment.status === 'approved') {
      await this.prisma.client.order.update({
        where: { id: orderId },
        data: {
          status: OrderStatus.PAID,
          paymentId: payment.id?.toString(),
          paymentType: payment.payment_method_id,
          paidAt: new Date(),
        },
      });
    }
  }

  async getPaymentByExternalReference(externalReference: string) {
    try {
      const results = await this.payment.search({
        options: {
          external_reference: externalReference,
        },
      });

      if (results.results && results.results.length > 0) {
        return results.results.sort((a, b) =>
          new Date(b.date_created!).getTime() - new Date(a.date_created!).getTime()
        )[0];
      }
      return null;
    } catch (error) {
      console.error('Error searching MP payment:', error);
      return null;
    }
  }

  async getPixQrCode(orderId: string) {
    const paymentSearch = await this.getPaymentByExternalReference(orderId);

    if (!paymentSearch) {
      throw new BadRequestException('Pagamento não encontrado para este pedido.');
    }

    const payment = await this.payment.get({ id: paymentSearch.id!.toString() });

    if (payment.payment_method_id !== 'pix') {
      throw new BadRequestException('Este pedido não foi pago via PIX.');
    }

    const transactionData = payment.point_of_interaction?.transaction_data;

    if (!transactionData) {
      throw new BadRequestException('Dados do QR Code não disponíveis.');
    }

    return {
      qrCode: transactionData.qr_code,
      qrCodeBase64: transactionData.qr_code_base64,
      expirationDate: payment.date_of_expiration
    };
  }
}
