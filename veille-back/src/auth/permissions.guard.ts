import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { hasPermission, Permission } from './roles.js';
import { User } from './user.entity.js';

const PERMISSIONS_KEY = 'permissions';

export const RequirePermissions = (...permissions: Permission[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);

/** À placer après `JwtAuthGuard`, qui renseigne `request.user`. */
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<Permission[] | undefined>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!required?.length) {
      return true;
    }
    const user = context.switchToHttp().getRequest<{ user?: User }>().user;
    const allowed =
      !!user && required.every((p) => hasPermission(user.role, p));
    if (!allowed) {
      throw new ForbiddenException('Votre rôle ne permet pas cette action');
    }
    return true;
  }
}
