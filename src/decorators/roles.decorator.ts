import { CustomDecorator, SetMetadata } from '@nestjs/common';
import { Roles } from '../roles/roles.enum'; // Adjust the import path as necessary

export const AllowedRoles = (roles: Roles[]): CustomDecorator<string> =>
  SetMetadata('roles', roles);
