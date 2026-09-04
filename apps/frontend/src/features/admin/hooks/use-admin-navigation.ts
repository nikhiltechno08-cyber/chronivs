'use client';

import { usePathname } from 'next/navigation';
import { useMemo } from 'react';

import { getAdminNavItemByPath } from '../config/navigation';

export function useAdminNavigation() {
  const pathname = usePathname();

  return useMemo(() => {
    const current = getAdminNavItemByPath(pathname);
    return {
      pathname,
      current,
      pageTitle: current?.label ?? 'Admin',
      breadcrumb: current?.breadcrumb ?? 'Admin',
    };
  }, [pathname]);
}
