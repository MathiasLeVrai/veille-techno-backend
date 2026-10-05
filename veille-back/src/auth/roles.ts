export enum Role {
  ADMIN = 'ADMIN',
  PO = 'PO',
  DEV = 'DEV',
  MOA = 'MOA',
  MOE = 'MOE',
}

export enum Permission {
  BoardRead = 'board:read',
  ListManage = 'list:manage',
  CardCreate = 'card:create',
  CardUpdate = 'card:update',
  CardDelete = 'card:delete',
  DashboardView = 'dashboard:view',
  UsersManage = 'users:manage',
}

/**
 * Matrice des droits : c'est la seule source de vérité, le front la reçoit
 * via `GET /api/users/me` (champ `permissions`).
 */
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  [Role.ADMIN]: Object.values(Permission),
  [Role.PO]: [
    Permission.BoardRead,
    Permission.ListManage,
    Permission.CardCreate,
    Permission.CardUpdate,
    Permission.CardDelete,
    Permission.DashboardView,
  ],
  [Role.MOE]: [
    Permission.BoardRead,
    Permission.CardCreate,
    Permission.CardUpdate,
    Permission.CardDelete,
    Permission.DashboardView,
  ],
  [Role.DEV]: [
    Permission.BoardRead,
    Permission.CardCreate,
    Permission.CardUpdate,
  ],
  [Role.MOA]: [
    Permission.BoardRead,
    Permission.CardCreate,
    Permission.DashboardView,
  ],
};

export function permissionsOf(role: string): Permission[] {
  return ROLE_PERMISSIONS[role as Role] ?? [];
}

export function hasPermission(role: string, permission: Permission): boolean {
  return permissionsOf(role).includes(permission);
}
