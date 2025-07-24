import { Roles } from '../../../roles/roles.enum';

export interface ITokenResponse {
  accessToken: string;
  refreshToken: string;
}

export interface IAuthPayload {
  id: string;
  user_role_id: string;
  username: string;
  email: string;
  area: [];
  region: string;
}

export interface IGetPermissionFromRolePayload {
  role: Roles;
  module: string;
}

export enum TokenType {
  ACCESS_TOKEN = 'AccessToken',
  REFRESH_TOKEN = 'RefreshToken',
}
