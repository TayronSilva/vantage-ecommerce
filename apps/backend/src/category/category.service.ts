import { Injectable } from '@nestjs/common';
import { PrismaService } from 'database/prisma/prisma.service';

@Injectable()
export class CategoryService {
    constructor(private prisma: PrismaService) { }

    findAll() {
        return this.prisma.client.category.findMany({
            orderBy: { name: 'asc' },
        });
    }

    findOne(id: number) {
        return this.prisma.client.category.findUnique({
            where: { id },
            include: { products: true },
        });
    }

    create(data: { name: string; slug: string; description?: string }) {
        return this.prisma.client.category.create({ data });
    }

    update(id: number, data: { name?: string; slug?: string; description?: string }) {
        return this.prisma.client.category.update({
            where: { id },
            data,
        });
    }

    remove(id: number) {
        return this.prisma.client.category.delete({ where: { id } });
    }
}
