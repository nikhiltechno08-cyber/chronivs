export type AdminUser = {
  email: string;
  name?: string | null;
  role?: string;
};

export type AdminSession = {
  user: AdminUser;
  expiresAt?: string | null;
};
