import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'database/prisma/prisma.service';
import { Prisma, OrderStatus } from '@prisma/client';
import { PaymentService } from 'src/payment/payment.service';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class OrderService {
  private readonly ORIGIN_ZIP_CODE = '26584-260';
  private readonly BOLETO_PROCESSING_FEE = 3.49;

  constructor(
    private prisma: PrismaService,
    private paymentService: PaymentService,
  ) { }

  async create(userId: number, dto: {
    items: { stockId: string; quantity: number }[];
    paymentMethod?: 'pix' | 'credit_card' | 'debit_card' | 'boleto';
    addressId?: number;
  }) {
    if (!dto.items?.length) {
      throw new BadRequestException('Order must have at least one item');
    }

    const address = await this.prisma.client.address.findFirst({
      where: dto.addressId ? { id: dto.addressId, userId } : { userId, isDefault: true }
    });

    if (!address) {
      throw new BadRequestException('Endereço de entrega não encontrado.');
    }

    const order = await this.prisma.client.$transaction(async (tx) => {
      let subtotal = 0;
      let totalWeight = 0;
      let totalVolume = 0;

      const orderItems: Prisma.OrderItemCreateWithoutOrderInput[] = [];

      for (const item of dto.items) {
        const stock = await tx.stock.findUnique({
          where: { id: item.stockId },
          include: { product: true },
        });

        if (!stock || stock.quantity < item.quantity) {
          throw new BadRequestException(`Estoque insuficiente: ${stock?.product.name || 'Item'}`);
        }

        await tx.stock.update({
          where: { id: stock.id },
          data: { quantity: { decrement: item.quantity } },
        });

        const itemTotal = Number(stock.product.price) * item.quantity;
        subtotal += itemTotal;

        totalWeight += (stock.product.weight || 0) * item.quantity;
        totalVolume += ((stock.product.height || 1) * (stock.product.width || 1) * (stock.product.length || 1)) * item.quantity;

        orderItems.push({
          productId: stock.product.id,
          productName: stock.product.name,
          productPrice: stock.product.price,
          stockId: stock.id,
          size: stock.size,
          color: stock.color,
          quantity: item.quantity,
        });
      }

      const freight = this.calculateInternalFreight(
        this.ORIGIN_ZIP_CODE,
        address.zipCode,
        totalWeight,
        totalVolume
      );

      const subtotalPlusFreight = subtotal + freight;

      const paymentMethod = dto.paymentMethod || 'pix';
      const discount = paymentMethod === 'pix' ? subtotalPlusFreight * 0.10 : 0;

      const boletoFee = paymentMethod === 'boleto' ? this.BOLETO_PROCESSING_FEE : 0;
      const totalWithDiscount = subtotalPlusFreight - discount + boletoFee;

      const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

      return tx.order.create({
        data: {
          userId: Number(userId),
          addressId: address.id,
          status: OrderStatus.PENDING,
          subtotal: new Prisma.Decimal(subtotal),
          freight: new Prisma.Decimal(freight),
          total: new Prisma.Decimal(totalWithDiscount),
          paymentType: paymentMethod.toUpperCase(),
          expiresAt,
          items: { create: orderItems },
        },
        include: {
          user: true,
          items: true,
          address: true,
        },
      });
    });

    const paymentMethod = dto.paymentMethod || 'pix';

    try {
      let paymentData;

      if (paymentMethod === 'pix') {
        paymentData = await this.paymentService.createPixPayment({
          id: order.id,
          total: order.total.toNumber(),
          user: {
            email: order.user.email,
            name: order.user.name ?? 'Cliente OnBack',
            cpf: (order.user.cpf ?? '').replace(/\D/g, '')
          },
        });
      } else if (paymentMethod === 'boleto') {
        if (!order.address) {
          throw new Error('Endereço é obrigatório para pagamento via boleto');
        }

        paymentData = await this.paymentService.createBoletoPayment({
          id: order.id,
          total: order.total.toNumber(),
          user: {
            email: order.user.email,
            name: order.user.name ?? 'Cliente OnBack',
            cpf: (order.user.cpf ?? '').replace(/\D/g, '')
          },
          address: {
            zipCode: order.address.zipCode,
            street: order.address.street,
            number: order.address.number,
            neighborhood: order.address.neighborhood,
            city: order.address.city,
            state: order.address.state,
          },
        });
      } else {
        paymentData = {
          paymentMethod,
          orderId: order.id,
          total: order.total.toNumber(),
          message: 'Use o token do Mercado Pago no frontend para processar o pagamento',
        };
      }

      return {
        message: paymentMethod === 'pix'
          ? 'Pedido criado com sucesso (Desconto de 10% aplicado para PIX)'
          : 'Pedido criado com sucesso. Processe o pagamento no frontend.',
        order,
        payment: paymentData,
      };
    } catch (error) {
      console.error(`Erro ao processar pagamento (${paymentMethod}):`, error);
      return {
        message: 'Pedido criado, mas falhou ao processar pagamento',
        order,
        payment: null,
      };
    }
  }

  private calculateInternalFreight(origin: string, destination: string, weight: number, volume: number): number {
    const originPrefix = origin.substring(0, 2);
    const destPrefix = destination.substring(0, 2);

    let baseRate = 12.00;

    if (originPrefix === destPrefix) {
      baseRate = 8.00;
    } else {
      baseRate = 20.00;
    }


    return Number(baseRate.toFixed(2));
  }

  async findAll() {
    return this.prisma.client.order.findMany({
      include: {
        user: true,
        items: true,
        address: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const order = await this.prisma.client.order.findUnique({
      where: { id },
      include: {
        user: true,
        items: true,
        address: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const productsWithImages = await this.prisma.client.product.findMany({
      where: {
        id: { in: order.items.map(i => i.productId) }
      },
      include: {
        images: true
      }
    });

    const baseUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/product-images`;
    let responseAddress = order.address;

    if (!responseAddress) {
      responseAddress = await this.prisma.client.address.findFirst({
        where: { userId: order.userId, isDefault: true }
      }) || await this.prisma.client.address.findFirst({
        where: { userId: order.userId }
      });
    }

    return {
      ...order,
      address: responseAddress,
      items: order.items.map(item => {
        const product = productsWithImages.find(p => p.id === item.productId);
        const mainImage = product?.images.find(img => img.isMain) || product?.images[0];
        return {
          ...item,
          imageUrl: mainImage ? `${baseUrl}/${mainImage.path}` : null
        };
      })
    };
  }

  async findByUser(userId: number) {
    const orders = await this.prisma.client.order.findMany({
      where: { userId },
      include: {
        user: true,
        items: true,
        address: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const productsWithImages = await this.prisma.client.product.findMany({
      where: {
        id: { in: orders.flatMap(o => o.items.map(i => i.productId)) }
      },
      include: {
        images: true
      }
    });

    const baseUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/product-images`;

    return Promise.all(orders.map(async order => {
      let responseAddress = order.address;

      if (!responseAddress) {
        responseAddress = await this.prisma.client.address.findFirst({
          where: { userId: order.userId, isDefault: true }
        }) || await this.prisma.client.address.findFirst({
          where: { userId: order.userId }
        });
      }

      return {
        ...order,
        address: responseAddress,
        items: order.items.map(item => {
          const product = productsWithImages.find(p => p.id === item.productId);
          const mainImage = product?.images.find(img => img.isMain) || product?.images[0];
          return {
            ...item,
            imageUrl: mainImage ? `${baseUrl}/${mainImage.path}` : null
          };
        })
      };
    }));
  }

  async cancel(orderId: string, status: OrderStatus = OrderStatus.CANCELED) {
    return this.prisma.client.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: { items: true },
      });

      if (!order) throw new NotFoundException('Order not found');
      if (order.status === OrderStatus.PAID) throw new BadRequestException('Não pode cancelar pedido pago');

      for (const item of order.items) {
        if (item.stockId) {
          await tx.stock.update({
            where: { id: item.stockId },
            data: { quantity: { increment: item.quantity } },
          });
        }
      }

      return tx.order.update({
        where: { id: orderId },
        data: { status },
      });
    });
  }

  async verifyPaymentStatus(orderId: string) {
    const order = await this.prisma.client.order.findUnique({
      where: { id: orderId },
    });

    if (!order) throw new NotFoundException('Pedido não encontrado');
    if (order.status === OrderStatus.PAID) return order;

    const mpPayment = await this.paymentService.getPaymentByExternalReference(orderId);

    if (mpPayment && mpPayment.status === 'approved') {
      return this.prisma.client.order.update({
        where: { id: orderId },
        data: {
          status: OrderStatus.PAID,
          paymentId: mpPayment.id?.toString(),
          paymentType: mpPayment.payment_method_id,
          paidAt: new Date(),
        },
      });
    }

    return order;
  }

  async getPixQrCode(orderId: string) {
    return this.paymentService.getPixQrCode(orderId);
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async handleCron() {
    const expiredOrders = await this.prisma.client.order.findMany({
      where: {
        status: OrderStatus.PENDING,
        expiresAt: {
          lt: new Date(),
        },
      },
      select: { id: true }
    });

    if (expiredOrders.length > 0) {
      for (const order of expiredOrders) {
        try {
          await this.cancel(order.id, OrderStatus.EXPIRED);
        } catch (error) {
        }
      }
    }
  }
}