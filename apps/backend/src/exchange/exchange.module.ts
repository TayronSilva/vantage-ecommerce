import { Module } from '@nestjs/common';
import { ExchangeService } from './exchange.service';
import { ExchangeController } from './exchange.controller';
import { PrismaService } from 'database/prisma/prisma.service';
import { PermissionsModule } from '../permissions/permissions.module';

@Module({
    imports: [PermissionsModule],
    controllers: [ExchangeController],
    providers: [ExchangeService, PrismaService],
    exports: [ExchangeService],
})
export class ExchangeModule { }
