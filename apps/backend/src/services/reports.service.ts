import { Injectable } from '@nestjs/common';
import { PrismaService } from 'database/prisma/prisma.service';

export interface SalesReportData {
    period: {
        start: Date;
        end: Date;
    };
    summary: {
        totalRevenue: number;
        totalOrders: number;
        averageTicket: number;
        paidOrders: number;
        pendingOrders: number;
    };
    byPaymentMethod: Array<{
        method: string;
        count: number;
        revenue: number;
    }>;
    byProduct: Array<{
        productId: string;
        productName: string;
        quantitySold: number;
        revenue: number;
    }>;
    dailyBreakdown?: Array<{
        date: string;
        orders: number;
        revenue: number;
    }>;
}

@Injectable()
export class ReportsService {
    constructor(private prisma: PrismaService) { }

    async getSalesReport(startDate: Date, endDate: Date): Promise<SalesReportData> {
        const orders = await this.prisma.client.order.findMany({
            where: {
                createdAt: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            include: {
                items: true,
            },
        });

        const paidOrdersList = orders.filter(o => o.status === 'PAID');
        const totalRevenue = paidOrdersList.reduce((sum, order) => sum + Number(order.total), 0);
        const totalOrders = orders.length;
        const averageTicket = paidOrdersList.length > 0 ? totalRevenue / paidOrdersList.length : 0;
        const paidOrders = paidOrdersList.length;
        const pendingOrders = orders.filter(o => o.status === 'PENDING').length;

        const paymentMethodMap = new Map<string, { count: number; revenue: number }>();
        paidOrdersList.forEach(order => {
            const method = order.paymentType || 'N/A';
            const current = paymentMethodMap.get(method) || { count: 0, revenue: 0 };
            paymentMethodMap.set(method, {
                count: current.count + 1,
                revenue: current.revenue + Number(order.total),
            });
        });

        const byPaymentMethod = Array.from(paymentMethodMap.entries()).map(([method, data]) => ({
            method,
            count: data.count,
            revenue: data.revenue,
        }));

        const productMap = new Map<string, { name: string; quantity: number; revenue: number }>();
        paidOrdersList.forEach(order => {
            order.items.forEach(item => {
                const productId = item.productId;
                const current = productMap.get(productId) || {
                    name: item.productName,
                    quantity: 0,
                    revenue: 0
                };
                productMap.set(productId, {
                    name: current.name,
                    quantity: current.quantity + item.quantity,
                    revenue: current.revenue + (item.quantity * Number(item.productPrice)),
                });
            });
        });

        const byProduct = Array.from(productMap.entries())
            .map(([productId, data]) => ({
                productId,
                productName: data.name,
                quantitySold: data.quantity,
                revenue: data.revenue,
            }))
            .sort((a, b) => b.revenue - a.revenue);

        const dailyMap = new Map<string, { orders: number; revenue: number }>();
        paidOrdersList.forEach(order => {
            const dateKey = order.createdAt ? order.createdAt.toISOString().split('T')[0] : 'N/A';
            const current = dailyMap.get(dateKey) || { orders: 0, revenue: 0 };
            dailyMap.set(dateKey, {
                orders: current.orders + 1,
                revenue: current.revenue + Number(order.total),
            });
        });

        const dailyBreakdown = Array.from(dailyMap.entries())
            .map(([date, data]) => ({
                date,
                orders: data.orders,
                revenue: data.revenue,
            }))
            .sort((a, b) => a.date.localeCompare(b.date));

        return {
            period: {
                start: startDate,
                end: endDate,
            },
            summary: {
                totalRevenue,
                totalOrders,
                averageTicket,
                paidOrders,
                pendingOrders,
            },
            byPaymentMethod,
            byProduct,
            dailyBreakdown,
        };
    }

    async getDashboardStats(): Promise<{
        todaySales: number;
        totalProducts: number;
        totalStock: number;
        totalCustomers: number;
    }> {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const todayOrders = await this.prisma.client.order.findMany({
            where: {
                status: 'PAID',
                paidAt: {
                    gte: today,
                    lt: tomorrow,
                },
            },
        });
        const todaySales = todayOrders.reduce((sum, order) => sum + Number(order.total), 0);

        const totalProducts = await this.prisma.client.product.count();

        const stockData = await this.prisma.client.stock.aggregate({
            _sum: {
                quantity: true,
            },
        });
        const totalStock = stockData._sum.quantity || 0;

        const totalCustomers = await this.prisma.client.user.count();

        return {
            todaySales,
            totalProducts,
            totalStock,
            totalCustomers,
        };
    }

    async getTopProducts(limit: number = 10): Promise<Array<{
        productId: string;
        productName: string;
        totalSold: number;
        revenue: number;
    }>> {
        const orderItems = await this.prisma.client.orderItem.findMany();

        const productMap = new Map<string, { name: string; quantity: number; revenue: number }>();
        orderItems.forEach(item => {
            const productId = item.productId;
            const current = productMap.get(productId) || {
                name: item.productName,
                quantity: 0,
                revenue: 0
            };
            productMap.set(productId, {
                name: current.name,
                quantity: current.quantity + item.quantity,
                revenue: current.revenue + (item.quantity * Number(item.productPrice)),
            });
        });

        return Array.from(productMap.entries())
            .map(([productId, data]) => ({
                productId,
                productName: data.name,
                totalSold: data.quantity,
                revenue: data.revenue,
            }))
            .sort((a, b) => b.totalSold - a.totalSold)
            .slice(0, limit);
    }

    convertToCSV(data: SalesReportData): string {
        const lines: string[] = [];

        lines.push('RELATÓRIO DE VENDAS');
        lines.push(`Período: ${data.period.start.toLocaleDateString('pt-BR')} a ${data.period.end.toLocaleDateString('pt-BR')}`);
        lines.push('');

        lines.push('RESUMO');
        lines.push(`Receita Total,R$ ${data.summary.totalRevenue.toFixed(2)}`);
        lines.push(`Total de Pedidos,${data.summary.totalOrders}`);
        lines.push(`Ticket Médio,R$ ${data.summary.averageTicket.toFixed(2)}`);
        lines.push(`Pedidos Pagos,${data.summary.paidOrders}`);
        lines.push(`Pedidos Pendentes,${data.summary.pendingOrders}`);
        lines.push('');

        lines.push('POR MÉTODO DE PAGAMENTO');
        lines.push('Método,Quantidade,Receita');
        data.byPaymentMethod.forEach(item => {
            lines.push(`${item.method},${item.count},R$ ${item.revenue.toFixed(2)}`);
        });
        lines.push('');

        lines.push('POR PRODUTO');
        lines.push('Produto,Quantidade Vendida,Receita');
        data.byProduct.forEach(item => {
            lines.push(`${item.productName},${item.quantitySold},R$ ${item.revenue.toFixed(2)}`);
        });

        return lines.join('\n');
    }
}
