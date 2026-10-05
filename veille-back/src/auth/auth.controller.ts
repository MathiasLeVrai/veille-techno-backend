import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { AuthService } from './auth.service.js';
import { LoginDto, RegisterDto, UpdateUserDto } from './dto.js';
import { JwtAuthGuard } from './jwt-auth.guard.js';
import { PermissionsGuard, RequirePermissions } from './permissions.guard.js';
import { Permission } from './roles.js';
import { toPublicUser, User } from './user.entity.js';

@ApiTags('Auth')
@Controller()
export class AuthController {
  constructor(private auth: AuthService) {}

  @Post('auth/register')
  register(@Body() dto: RegisterDto) {
    return this.auth.register(dto);
  }

  @Post('auth/login')
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto.email, dto.password);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('users/me')
  me(@Req() req: Request & { user: User }) {
    return toPublicUser(req.user);
  }

  @ApiTags('Users')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions(Permission.UsersManage)
  @Get('users')
  findAll() {
    return this.auth.findAll();
  }

  @ApiTags('Users')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch('users/:id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
    @Req() req: Request & { user: User },
  ) {
    return this.auth.update(id, dto, req.user);
  }
}
