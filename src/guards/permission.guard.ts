import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Roles } from '../roles/roles.enum';
import { PermissionType } from '../roles/permission.enum';

// import { PrismaService } from 'src/common/services/prisma.service';
import { DrizzleService } from '../common/services/drizzle.service';
import { mUser, mUserRoles } from '../schema';
import { eq } from 'drizzle-orm';

@Injectable()
export class PermissionsGuard implements CanActivate {
  private db: any;
  constructor(
    private readonly reflector: Reflector,
    private readonly drizzleService: DrizzleService,
  ) {
    this.db = this.drizzleService.getDatabase();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<Roles[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const method = request.method;

    const userPermissions = this.db
      .select({
        user: mUser,
        role: mUserRoles,
      })
      .from(mUser)
      .leftJoin(mUserRoles, eq(mUser.user_role_id, mUserRoles.id))
      .where(eq(mUser.username, user.username))
      .execute();

    const hasPermission = (permissionType: PermissionType) => {
      return userPermissions.some(
        (role: { name: PermissionType }) => role.name === permissionType,
      );
    };

    let permissionGranted = false;

    switch (method) {
      case 'GET':
        permissionGranted =
          hasPermission(PermissionType.USER) ||
          hasPermission(PermissionType.ADMIN);
        break;
      case 'POST':
      case 'PUT':
        permissionGranted = hasPermission(PermissionType.ADMIN);
        break;
      case 'DELETE':
        permissionGranted = hasPermission(PermissionType.ADMIN);
        break;
      default:
        throw new ForbiddenException('notHaveEnoughPermissions');
    }

    if (!permissionGranted) {
      throw new ForbiddenException('notHaveEnoughPermissions');
    }

    return true;
  }
}
