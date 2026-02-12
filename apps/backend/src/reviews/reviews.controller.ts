import { Controller, Get, Post, Body, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { AuthGuard } from '../auth/auth.guard';

import { PermissionsGuard, RequirePermission } from '../permissions/permissions.guard';

@Controller('reviews')
export class ReviewsController {
    constructor(private readonly reviewsService: ReviewsService) { }

    @Get()
    @UseGuards(AuthGuard, PermissionsGuard)
    @RequirePermission('review:manage')
    findAll() {
        return this.reviewsService.findAll();
    }

    @Post()
    @UseGuards(AuthGuard)
    async create(@Req() req: any, @Body() body: { rating: number; comment?: string; productId: string }) {
        try {
            return await this.reviewsService.create({
                ...body,
                userId: Number(req.user.sub),
            });
        } catch (error) {
            throw error;
        }
    }

    @Get('product/:productId')
    findByProduct(@Param('productId') productId: string) {
        return this.reviewsService.findByProduct(productId);
    }

    @Get('product/:productId/average')
    getAverageRating(@Param('productId') productId: string) {
        return this.reviewsService.getAverageRating(productId);
    }

    @Delete(':id')
    @UseGuards(AuthGuard)
    remove(@Req() req: any, @Param('id') id: string) {
        return this.reviewsService.delete(id, Number(req.user.sub));
    }
}
