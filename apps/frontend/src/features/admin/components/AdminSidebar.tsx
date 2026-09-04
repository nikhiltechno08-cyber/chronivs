'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

import { ADMIN_LOGOUT_NAV, ADMIN_NAV_ITEMS } from '../config/navigation';
import { ADMIN_ROUTES } from '../constants/routes';
import { useAdminAuth } from '../auth/use-admin-auth';
import { cn } from '@chronivs/ui';

type AdminSidebarProps = {
  collapsed: boolean;
  mobileOpen: boolean;
  onToggleCollapsed: () => void;
  onCloseMobile: () => void;
};

export function AdminSidebar({
  collapsed,
  mobileOpen,
  onToggleCollapsed,
  onCloseMobile,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAdminAuth();
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

  const LogoutIcon = ADMIN_LOGOUT_NAV.icon;

  return (
    <>
      <div
        className={cn('admin-sidebar-backdrop', mobileOpen && 'is-open')}
        onClick={onCloseMobile}
        aria-hidden="true"
      />

      <aside
        className={cn(
          'admin-sidebar',
          collapsed && 'is-collapsed',
          mobileOpen && 'is-mobile-open',
        )}
        aria-label="Admin navigation"
      >
        <div className="admin-sidebar-brand">
          <Link href={ADMIN_ROUTES.dashboard} className="admin-sidebar-logo" onClick={onCloseMobile}>
            <span className="admin-sidebar-mark" aria-hidden="true">
              C
            </span>
            <span className="admin-sidebar-brand-text">
              <strong>Chronivs</strong>
              <span>Admin</span>
            </span>
          </Link>

          <button
            type="button"
            className="admin-sidebar-collapse"
            onClick={onToggleCollapsed}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? '›' : '‹'}
          </button>
        </div>

        <nav className="admin-sidebar-nav">
          <p className="admin-sidebar-label">Navigation</p>
          <ul>
            {ADMIN_NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    className={cn('admin-sidebar-link', isActive && 'is-active')}
                    onClick={onCloseMobile}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <Icon aria-hidden="true" />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="admin-sidebar-footer">
          <button
            type="button"
            className="admin-sidebar-link admin-sidebar-logout"
            onClick={() => void handleLogout()}
            disabled={isLoggingOut}
          >
            <LogoutIcon aria-hidden="true" />
            <span>{isLoggingOut ? 'Signing out…' : ADMIN_LOGOUT_NAV.label}</span>
          </button>
        </div>
      </aside>
    </>
  );
}
