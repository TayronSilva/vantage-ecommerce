import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { CategoryService } from './category.service';
import { AuthGuard } from '../auth/auth.guard';
import { PermissionsGuard, RequirePermission } from '../permissions/permissions.guard';

@Controller('categories')
export class CategoryController {
    constructor(private readonly service: CategoryService) { }

    @Get()
    findAll() {
        return this.service.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.service.findOne(+id);
    }

    @Post()
    @UseGuards(AuthGuard, PermissionsGuard)
    @RequirePermission('product:create')
    create(@Body() data: { name: string; slug: string; description?: string }) {
        return this.service.create(data);
    }

    @Patch(':id')
    @UseGuards(AuthGuard, PermissionsGuard)
    @RequirePermission('product:update')
    update(@Param('id') id: string, @Body() data: { name?: string; slug?: string; description?: string }) {
        return this.service.update(+id, data);
    }

    @Delete(':id')
    @UseGuards(AuthGuard, PermissionsGuard)
    @RequirePermission('product:delete')
    remove(@Param('id') id: string) {
        return this.service.remove(+id);
    }
}
