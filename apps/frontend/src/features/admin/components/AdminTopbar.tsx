'use client';

import { Bell, LogOut, Menu } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { GlobalSearch } from '@/features/admin/search';

import { ADMIN_ROUTES } from '../constants/routes';
import { useAdminAuth } from '../auth/use-admin-auth';
import { useAdminNavigation } from '../hooks/use-admin-navigation';

type AdminTopbarProps = {
  onOpenMobileNav: () => void;
};

function getInitials(email?: string | null, name?: string | null): string {
  const source = name?.trim() || email?.trim() || 'Admin';
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]?.[0] ?? ''}${parts[1]?.[0] ?? ''}`.toUpperCase();
  }
  return source.slice(0, 2).toUpperCase();
}

export function AdminTopbar({ onOpenMobileNav }: AdminTopbarProps) {
  const router = useRouter();
  const { user, logout } = useAdminAuth();
  const { breadcrumb, pageTitle } = useAdminNavigation();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      router.replace(ADMIN_ROUTES.login);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="admin-topbar">
      <div className="admin-topbar-left">
        <button
          type="button"
          className="admin-topbar-menu"
          onClick={onOpenMobileNav}
          aria-label="Open navigation menu"
        >
          <Menu aria-hidden="true" />
        </button>

        <div className="admin-topbar-titles">
          <p className="admin-topbar-breadcrumb">Admin / {breadcrumb}</p>
          <h2>{pageTitle}</h2>
        </div>
      </div>

      <div className="admin-topbar-center">
        <GlobalSearch />
      </div>

      <div className="admin-topbar-right">
        <button
          type="button"
          className="admin-topbar-icon-btn"
          aria-label="Notifications (coming soon)"
          disabled
          title="Notifications coming soon"
        >
          <Bell aria-hidden="true" />
        </button>

        <div className="admin-topbar-profile">
          <span className="admin-topbar-avatar" aria-hidden="true">
            {getInitials(user?.email, user?.name)}
          </span>
          <div className="admin-topbar-profile-copy">
            <span className="admin-topbar-profile-name">{user?.name ?? 'Admin User'}</span>
            <span className="admin-topbar-profile-email">{user?.email ?? 'admin@chronivs.com'}</span>
          </div>
        </div>

        <button
          type="button"
          className="admin-topbar-logout"
          onClick={() => void handleLogout()}
          disabled={isLoggingOut}
        >
          <LogOut aria-hidden="true" />
          <span>{isLoggingOut ? 'Signing out…' : 'Logout'}</span>
        </button>
      </div>
    </header>
  );
}
