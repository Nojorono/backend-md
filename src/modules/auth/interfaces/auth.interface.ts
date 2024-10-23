import { Roles } from '../../../roles/roles.enum';

export interface ITokenResponse {
  accessToken: string;
  refreshToken: string;
}

export interface IAuthPayload {
  id: number;
  user_role_id: string;
  username: string;
  is_active: string;
  email: string;
}

export interface IGetPermissionFromRolePayload {
  role: Roles;
  module: string;
}

export enum TokenType {
  ACCESS_TOKEN = 'AccessToken',
  REFRESH_TOKEN = 'RefreshToken',
}
