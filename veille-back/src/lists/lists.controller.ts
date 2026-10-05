import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import {
  PermissionsGuard,
  RequirePermissions,
} from '../auth/permissions.guard.js';
import { Permission } from '../auth/roles.js';
import { User } from '../auth/user.entity.js';
import { CreateListDto, UpdateListDto } from './dto.js';
import { ListsService } from './lists.service.js';

@ApiTags('Lists')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('lists')
export class ListsController {
  constructor(private lists: ListsService) {}

  @Get()
  @RequirePermissions(Permission.BoardRead)
  findAll() {
    return this.lists.findAll();
  }

  @Post()
  @RequirePermissions(Permission.ListManage)
  create(@Body() dto: CreateListDto, @Req() req: Request & { user: User }) {
    return this.lists.create(dto, req.user.id);
  }

  @Patch(':id')
  @RequirePermissions(Permission.ListManage)
  update(@Param('id') id: string, @Body() dto: UpdateListDto) {
    return this.lists.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  @RequirePermissions(Permission.ListManage)
  remove(@Param('id') id: string) {
    return this.lists.remove(id);
  }
}
