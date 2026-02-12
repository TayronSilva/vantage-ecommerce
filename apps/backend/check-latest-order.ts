
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';

dotenv.config();

async function main() {
    const connectionString = process.env.DATABASE_URL;
    const pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool);
    const prisma = new PrismaClient({ adapter });

    try {
        const orders = await prisma.order.findMany({
            include: {
                user: true,
                address: true,
                items: true,
            },
            orderBy: { createdAt: 'desc' },
            take: 1
        });
        console.log('--- LATEST ORDER ---');
        console.log(JSON.stringify(orders, null, 2));

    } catch (error) {
        console.error(error);
    } finally {
        await prisma.$disconnect();
        await pool.end();
    }
}

main();
