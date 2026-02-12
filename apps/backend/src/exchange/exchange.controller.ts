import { Controller, Get, Post, Body, Param, Patch, UseGuards, Req } from '@nestjs/common';
import { ExchangeService } from './exchange.service';
import { AuthGuard } from '../auth/auth.guard';
import { PermissionsGuard, RequirePermission } from '../permissions/permissions.guard';

@Controller('exchanges')
export class ExchangeController {
    constructor(private readonly exchangeService: ExchangeService) { }

    @Post('request')
    @UseGuards(AuthGuard)
    createRequest(@Req() req: any, @Body() dto: { orderId: string; reason: string; evidenceUrls?: string[] }) {
        return this.exchangeService.createRequest(Number(req.user.sub), dto);
    }

    @Get('me')
    @UseGuards(AuthGuard)
    findMyRequests(@Req() req: any) {
        return this.exchangeService.findMyRequests(Number(req.user.sub));
    }

    @Get()
    @UseGuards(AuthGuard, PermissionsGuard)
    @RequirePermission('exchange:manage')
    findAll() {
        return this.exchangeService.findAll();
    }

    @Patch(':id/status')
    @UseGuards(AuthGuard, PermissionsGuard)
    @RequirePermission('exchange:manage')
    updateStatus(@Param('id') id: string, @Body() dto: { status: string; adminNotes?: string }) {
        return this.exchangeService.updateStatus(id, dto);
    }
}
