import { Controller, Get, Post, Body, Patch, Delete, UseGuards, Request, NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '../auth/auth.guard';
import { CreateUserDto } from './dto/create-user.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UpdateUserDto } from './dto/update-user.dto';
import { PermissionsGuard, RequirePermission } from '../permissions/permissions.guard';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Post()
  @ApiOperation({ summary: 'Create new user (Customer)' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.createUserAsync(createUserDto);
  }

  @UseGuards(AuthGuard, PermissionsGuard)
  @RequirePermission('user:create')
  @Post('internal')
  @ApiOperation({ summary: 'Create new internal user (staff/admin)' })
  async createInternal(@Body() createUserDto: CreateUserDto) {
    return this.usersService.createInternalUserAsync(createUserDto);
  }

  @UseGuards(AuthGuard, PermissionsGuard)
  @RequirePermission('user:view')
  @Get()
  @ApiOperation({ summary: 'List all users' })
  async findAll() {
    return this.usersService.findAllUsersAsync();
  }

  @UseGuards(AuthGuard)
  @Get('me')
  async getMe(@Request() req) {
    const userId = req.user.sub;
    const user = await this.usersService.findUserByIdAsync(userId);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  @UseGuards(AuthGuard)
  @Patch('me')
  async updateMe(@Request() req, @Body() updateUserDto: UpdateUserDto) {
    const userId = req.user.sub;
    return this.usersService.updateSelfAsync(userId, updateUserDto);
  }

  @UseGuards(AuthGuard)
  @Delete('me')
  @ApiOperation({ summary: 'Deactivate own account' })
  async deactivateMe(@Request() req) {
    const userId = req.user.sub;
    return this.usersService.deactivateUserAsync(userId);
  }

}