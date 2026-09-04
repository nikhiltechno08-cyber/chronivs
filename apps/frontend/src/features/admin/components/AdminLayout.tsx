'use client';

import { useEffect, useState, type ReactNode } from 'react';

import { AdminSidebar } from './AdminSidebar';
import { AdminTopbar } from './AdminTopbar';

type AdminLayoutProps = {
  children: ReactNode;
};

const SIDEBAR_COLLAPSED_KEY = 'chronivs-admin-sidebar-collapsed';

export function AdminLayout({ children }: AdminLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(SIDEBAR_COLLAPSED_KEY);
    if (stored === 'true') {
      setCollapsed(true);
    }
  }, []);

  const handleToggleCollapsed = () => {
    setCollapsed((value) => {
      const next = !value;
      window.localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(next));
      return next;
    });
  };

  return (
    <div className={collapsed ? 'admin-shell is-sidebar-collapsed' : 'admin-shell'}>
      <AdminSidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onToggleCollapsed={handleToggleCollapsed}
        onCloseMobile={() => setMobileOpen(false)}
      />

      <div className="admin-shell-main">
        <AdminTopbar onOpenMobileNav={() => setMobileOpen(true)} />
        <main className="admin-shell-content">{children}</main>
      </div>
    </div>
  );
}
