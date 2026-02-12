import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from '../database/prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ProductModule } from './product/product.module';
import { StockModule } from './stock/stock.module';
import { OrderModule } from './order/order.module';
import { CommonModule } from './common/common.module';
import { PaymentModule } from './payment/payment.module';
import { PermissionsModule } from './permissions/permissions.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { CategoryModule } from './category/category.module';
import { ReviewsModule } from './reviews/reviews.module';
import { ExchangeModule } from './exchange/exchange.module';
import { ReportsModule } from './reports/reports.module';
import { MercadoPagoModule } from './webhooks/mercadopago.module';
import { AddressModule } from './address/address.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '7d' },
    }),
    PrismaModule,
    UsersModule,
    AuthModule,
    ProductModule,
    StockModule,
    CategoryModule,
    OrderModule,
    PaymentModule,
    CommonModule,
    DashboardModule,
    PermissionsModule,
    ReportsModule,
    MercadoPagoModule,
    ReviewsModule,
    ExchangeModule,
    AddressModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
