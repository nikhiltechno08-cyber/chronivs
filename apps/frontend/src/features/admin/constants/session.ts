import { ADMIN_ROUTES } from './routes';

/** Must match backend `ADMIN_SESSION_COOKIE_NAME` default. */
export const ADMIN_SESSION_COOKIE_NAME = 'chronivs_admin_session';

export const ADMIN_AUTH_BROADCAST_CHANNEL = 'chronivs-admin-auth';

export const ADMIN_LOGIN_PATH = ADMIN_ROUTES.login;

export function isAdminLoginPath(pathname: string): boolean {
  return pathname === ADMIN_LOGIN_PATH || pathname === `${ADMIN_LOGIN_PATH}/`;
}

export function isProtectedAdminPath(pathname: string): boolean {
  if (!pathname.startsWith('/admin/')) {
    return false;
  }
  return !isAdminLoginPath(pathname);
}
