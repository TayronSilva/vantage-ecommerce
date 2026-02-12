import { Module } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { ReviewsController } from './reviews.controller';
import { PrismaService } from 'database/prisma/prisma.service';
import { JwtModule } from '@nestjs/jwt';

import { PermissionsModule } from '../permissions/permissions.module';

@Module({
    imports: [JwtModule, PermissionsModule],
    controllers: [ReviewsController],
    providers: [ReviewsService, PrismaService],
    exports: [ReviewsService],
})
export class ReviewsModule { }
