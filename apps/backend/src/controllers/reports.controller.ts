import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { ReportsService } from '../services/reports.service';
import { AuthGuard } from '../auth/auth.guard';
import { PermissionsGuard, RequirePermission } from '../permissions/permissions.guard';

@Controller('reports')
@UseGuards(AuthGuard, PermissionsGuard)
@RequirePermission('report:view')
export class ReportsController {
    constructor(private reportsService: ReportsService) { }

    @Get('sales')
    async getSalesReport(
        @Query('start') startDate?: string,
        @Query('end') endDate?: string,
    ) {
        const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const end = endDate ? new Date(endDate) : new Date();

        return this.reportsService.getSalesReport(start, end);
    }

    @Get('sales/export')
    async exportSalesReport(
        @Query('start') startDate?: string,
        @Query('end') endDate?: string,
        @Query('format') format?: string,
        @Res() res?: Response,
    ) {
        const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const end = endDate ? new Date(endDate) : new Date();

        const reportData = await this.reportsService.getSalesReport(start, end);

        if (format === 'csv' && res) {
            const csv = this.reportsService.convertToCSV(reportData);
            const filename = `relatorio_vendas_${start.toISOString().split('T')[0]}_${end.toISOString().split('T')[0]}.csv`;

            res.setHeader('Content-Type', 'text/csv; charset=utf-8');
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
            return res.send('\uFEFF' + csv);
            return reportData;
        }
    }

    @Get('products/top')
    async getTopProducts(@Query('limit') limit?: string) {
        const limitNum = limit ? parseInt(limit, 10) : 10;
        return this.reportsService.getTopProducts(limitNum);
    }

    @Get('dashboard-stats')
    async getDashboardStats() {
        return this.reportsService.getDashboardStats();
    }
}
