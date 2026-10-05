import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { RegisterDto, UpdateUserDto } from './dto.js';
import { hasPermission, Permission, Role } from './roles.js';
import { toPublicUser, User } from './user.entity.js';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private users: Repository<User>,
    private jwt: JwtService,
  ) {}

  /** Le premier compte devient ADMIN ; les suivants sont DEV jusqu'à ce qu'un admin change leur rôle. */
  async register(dto: RegisterDto) {
    const existing = await this.users.findOne({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictException('Email déjà utilisé');
    }

    const count = await this.users.count();
    const user = this.users.create({
      email: dto.email,
      name: dto.name,
      password: await bcrypt.hash(dto.password, 10),
      role: count === 0 ? Role.ADMIN : Role.DEV,
    });
    await this.users.save(user);
    return toPublicUser(user);
  }

  async login(email: string, password: string) {
    const user = await this.users.findOne({ where: { email } });
    const ok = user && (await bcrypt.compare(password, user.password));
    if (!ok) {
      throw new UnauthorizedException('Identifiants invalides');
    }
    const accessToken = await this.jwt.signAsync({ sub: user.id });
    return { accessToken };
  }

  async findAll() {
    const users = await this.users.find({ order: { createdAt: 'ASC' } });
    return users.map(toPublicUser);
  }

  async update(id: string, dto: UpdateUserDto, current: User) {
    const user = await this.users.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('Utilisateur introuvable');
    }
    const isAdmin = hasPermission(current.role, Permission.UsersManage);
    if (current.id !== user.id && !isAdmin) {
      throw new ForbiddenException('Accès refusé');
    }
    if (dto.role !== undefined && !isAdmin) {
      throw new ForbiddenException('Seul un admin peut changer un rôle');
    }
    if (
      dto.role !== undefined &&
      user.role === Role.ADMIN &&
      dto.role !== Role.ADMIN
    ) {
      const admins = await this.users.count({ where: { role: Role.ADMIN } });
      if (admins <= 1) {
        throw new BadRequestException(
          'Impossible de retirer le dernier administrateur',
        );
      }
    }
    if (dto.email && dto.email !== user.email) {
      const taken = await this.users.findOne({ where: { email: dto.email } });
      if (taken) {
        throw new ConflictException('Email déjà utilisé');
      }
      user.email = dto.email;
    }
    if (dto.name !== undefined) user.name = dto.name;
    if (dto.role !== undefined) user.role = dto.role;
    await this.users.save(user);
    return toPublicUser(user);
  }
}
