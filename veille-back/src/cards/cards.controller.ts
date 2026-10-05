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
import { CardsService } from './cards.service.js';
import { CreateCardDto, UpdateCardDto } from './dto.js';

@ApiTags('Cards')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller()
export class CardsController {
  constructor(private cards: CardsService) {}

  @Get('cards')
  @RequirePermissions(Permission.BoardRead)
  findAll() {
    return this.cards.findAll();
  }

  @Get('lists/:listId/cards')
  @RequirePermissions(Permission.BoardRead)
  findByList(@Param('listId') listId: string) {
    return this.cards.findByList(listId);
  }

  @Post('lists/:listId/cards')
  @RequirePermissions(Permission.CardCreate)
  create(
    @Param('listId') listId: string,
    @Body() dto: CreateCardDto,
    @Req() req: Request & { user: User },
  ) {
    return this.cards.create(listId, dto, req.user.id);
  }

  @Get('cards/:id')
  @RequirePermissions(Permission.BoardRead)
  findOne(@Param('id') id: string) {
    return this.cards.findOne(id);
  }

  @Patch('cards/:id')
  @RequirePermissions(Permission.CardUpdate)
  update(@Param('id') id: string, @Body() dto: UpdateCardDto) {
    return this.cards.update(id, dto);
  }

  @Delete('cards/:id')
  @HttpCode(204)
  @RequirePermissions(Permission.CardDelete)
  remove(@Param('id') id: string) {
    return this.cards.remove(id);
  }
}
