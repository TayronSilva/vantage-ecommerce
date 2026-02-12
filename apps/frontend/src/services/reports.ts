import { api } from './api';

export interface SalesReport {
    period: {
        start: string;
        end: string;
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
    dailyBreakdown: Array<{
        date: string;
        orders: number;
        revenue: number;
    }>;
}

export const reportsService = {
    async getSalesReport(start?: string, end?: string): Promise<SalesReport> {
        let url = '/reports/sales';
        const params = new URLSearchParams();
        if (start) params.append('start', start);
        if (end) params.append('end', end);

        const queryString = params.toString();
        if (queryString) url += `?${queryString}`;

        return api.get<SalesReport>(url);
    },

    async exportSalesReport(start?: string, end?: string) {
        let url = '/reports/sales/export?format=csv';
        if (start) url += `&start=${start}`;
        if (end) url += `&end=${end}`;

        const response = await api.requestRaw(url, { method: 'GET' });
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.setAttribute('download', `relatorio_vendas_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
    },

    async getDashboardStats(): Promise<{
        todaySales: number;
        totalProducts: number;
        totalStock: number;
        totalCustomers: number;
    }> {
        return api.get('/reports/dashboard-stats');
    }
};
