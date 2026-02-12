
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
                profiles: {
                    include: {
                        accessProfile: true
                    }
                }
            },
        });
        console.log('--- USERS ---');
        console.log(JSON.stringify(users, null, 2));

        const profiles = await prisma.accessProfile.findMany();
        console.log('--- PROFILES ---');
        console.log(JSON.stringify(profiles, null, 2));

    } catch (error) {
        console.error(error);
    } finally {
        await prisma.$disconnect();
        await pool.end();
    }
}

main();
