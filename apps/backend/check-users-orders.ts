
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
        const users = await prisma.user.findMany({
            include: {
                _count: {
                    select: { orders: true }
                }
            }
        });
        console.log('--- USERS AND ORDER COUNTS ---');
        users.forEach(u => {
            console.log(`User ID: ${u.id}, Name: ${u.name}, Email: ${u.email}, Orders: ${u._count.orders}`);
        });

    } catch (error) {
        console.error(error);
    } finally {
        await prisma.$disconnect();
        await pool.end();
    }
}

main();
