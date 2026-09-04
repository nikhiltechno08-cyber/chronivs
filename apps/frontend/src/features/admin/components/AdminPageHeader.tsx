'use client';

import { type ReactNode } from 'react';

type AdminPageHeaderProps = {
  title: string;
  description: string;
  actions?: ReactNode;
};

export function AdminPageHeader({ title, description, actions }: AdminPageHeaderProps) {
  return (
    <header className="admin-page-header">
      <div className="admin-page-header-copy">
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {actions ? <div className="admin-page-header-actions">{actions}</div> : null}
    </header>
  );
}
