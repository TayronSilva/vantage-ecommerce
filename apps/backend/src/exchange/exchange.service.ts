import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'database/prisma/prisma.service';
import { OrderStatus } from '@prisma/client';

@Injectable()
export class ExchangeService {
    constructor(private prisma: PrismaService) { }

    async createRequest(userId: number, dto: { orderId: string; reason: string; evidenceUrls?: string[] }) {
        const order = await this.prisma.client.order.findUnique({
            where: { id: dto.orderId, userId },
        });

        if (!order) {
            throw new NotFoundException('Pedido não encontrado.');
        }

        if (order.status !== OrderStatus.PAID) {
            throw new BadRequestException('Somente pedidos pagos podem ser trocados.');
        }

        return this.prisma.client.$transaction(async (tx) => {
            await tx.order.update({
                where: { id: order.id },
                data: { status: OrderStatus.EXCHANGE_REQUESTED },
            });

            return tx.exchange.create({
                data: {
                    orderId: order.id,
                    reason: dto.reason,
                    evidenceUrls: dto.evidenceUrls || [],
                    status: 'PENDING',
                },
            });
        });
    }

    async findAll() {
        return this.prisma.client.exchange.findMany({
            include: {
                order: {
                    include: {
                        user: {
                            select: { name: true, email: true },
                        },
                        items: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findMyRequests(userId: number) {
        return this.prisma.client.exchange.findMany({
            where: {
                order: {
                    userId
                }
            },
            include: {
                order: {
                    include: {
                        items: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async updateStatus(id: string, dto: { status: string; adminNotes?: string }) {
        const exchange = await this.prisma.client.exchange.findUnique({
            where: { id },
        });

        if (!exchange) {
            throw new NotFoundException('Solicitação de troca não encontrada.');
        }

        return this.prisma.client.$transaction(async (tx) => {
            const updatedExchange = await tx.exchange.update({
                where: { id },
                data: {
                    status: dto.status,
                    adminNotes: dto.adminNotes,
                },
            });

            if (dto.status === 'APPROVED') {
                await tx.order.update({
                    where: { id: exchange.orderId },
                    data: { status: OrderStatus.EXCHANGED },
                });
            } else if (dto.status === 'REJECTED') {
                await tx.order.update({
                    where: { id: exchange.orderId },
                    data: { status: OrderStatus.PAID },
                });
            }

            return updatedExchange;
        });
    }
}
