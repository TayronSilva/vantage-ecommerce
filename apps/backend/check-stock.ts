
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
        const products = await prisma.product.findMany({
            include: {
                stocks: true,
            },
        });
        console.log('--- PRODUCTS AND STOCKS ---');
        console.log(JSON.stringify(products, null, 2));

        const stocks = await prisma.stock.findMany({
            include: { product: true }
        });
        console.log('--- ALL STOCKS ---');
        console.log(JSON.stringify(stocks, null, 2));

    } catch (error) {
        console.error(error);
    } finally {
        await prisma.$disconnect();
        await pool.end();
    }
}

main();
