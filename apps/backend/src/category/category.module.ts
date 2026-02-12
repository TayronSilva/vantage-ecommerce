import { Module } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
import { PrismaService } from 'database/prisma/prisma.service';
import { PermissionsModule } from '../permissions/permissions.module';

@Module({
    imports: [PermissionsModule],
    controllers: [CategoryController],
    providers: [CategoryService, PrismaService],
    exports: [CategoryService],
})
export class CategoryModule { }
