import { Injectable } from '@nestjs/common';
import { PrismaService } from 'database/prisma/prisma.service';
import { PermissionsService } from '../permissions/permissions.service';

@Injectable()
export class ReviewsService {
    constructor(
        private prisma: PrismaService,
        private permissionsService: PermissionsService
    ) { }

    async create(data: { rating: number; comment?: string; userId: number; productId: string }) {
        try {

            const user = await this.prisma.client.user.findUnique({ where: { id: data.userId } });
            if (!user) {
                throw new Error(`Usuário não encontrado: ${data.userId}`);
            }

            const product = await this.prisma.client.product.findUnique({ where: { id: data.productId } });
            if (!product) {
                throw new Error(`Produto não encontrado: ${data.productId}`);
            }

            return await this.prisma.client.review.create({
                data,
                include: {
                    user: {
                        select: {
                            name: true,
                        },
                    },
                },
            });
        } catch (error) {
            throw error;
        }
    }

    async findAll() {
        return this.prisma.client.review.findMany({
            include: {
                user: { select: { name: true, email: true } },
                product: { select: { name: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    async findByProduct(productId: string) {
        return this.prisma.client.review.findMany({
            where: { productId },
            include: {
                user: {
                    select: {
                        name: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }

    async getAverageRating(productId: string) {
        const aggregate = await this.prisma.client.review.aggregate({
            where: { productId },
            _avg: {
                rating: true,
            },
            _count: {
                rating: true,
            },
        });

        return {
            average: aggregate._avg.rating || 0,
            count: aggregate._count.rating,
        };
    }

    async delete(id: string, userId: number) {
        const canModerate = await this.permissionsService.hasPermission(userId, 'review:manage');

        if (canModerate) {
            return this.prisma.client.review.delete({
                where: { id },
            });
        }

        return this.prisma.client.review.deleteMany({
            where: {
                id,
                userId,
            },
        });
    }
}
