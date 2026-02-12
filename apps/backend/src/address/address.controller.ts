import { Controller, Get, Post, Body, Patch, Param, UseGuards, Request, ParseIntPipe, Delete } from '@nestjs/common';
import { AddressService } from './address.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/auth.guard';
import { PermissionsGuard, RequirePermission } from '../permissions/permissions.guard';
import { CreateAddressDto } from './dto/create-address.dto';

@ApiTags('address')
@Controller('address')
@UseGuards(AuthGuard, PermissionsGuard)
export class AddressController {
  constructor(private readonly addressService: AddressService) { }

  @Post()
  @RequirePermission('address:manage')
  @ApiOperation({ summary: 'Create a new address' })
  async create(@Request() req, @Body() dto: CreateAddressDto) {
    const userId = Number(req.user.sub || req.user.id);
    return this.addressService.createAddress(userId, dto);
  }

  @Get('me')
  @RequirePermission('address:manage')
  @ApiOperation({ summary: 'Get user addresses' })
  async findMyAddresses(@Request() req) {
    const userId = Number(req.user.sub || req.user.id);
    return this.addressService.findAllByUser(userId);
  }

  @Patch(':id/set-default')
  @RequirePermission('address:manage')
  @ApiOperation({ summary: 'Set an address as default' })
  async setDefault(
    @Request() req,
    @Param('id', ParseIntPipe) addressId: number
  ) {
    const userId = Number(req.user.sub || req.user.id);
    return this.addressService.setDefault(userId, addressId);
  }

  @Delete(':id')
  @RequirePermission('address:manage')
  @ApiOperation({ summary: 'Remove address' })
  async remove(
    @Request() req,
    @Param('id', ParseIntPipe) addressId: number) {
    const userId = Number(req.user.sub || req.user.id);
    return this.addressService.remove(userId, addressId);
  }
}