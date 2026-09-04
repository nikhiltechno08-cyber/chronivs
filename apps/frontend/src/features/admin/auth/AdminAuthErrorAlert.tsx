'use client';

import { AlertCircle } from 'lucide-react';

type AdminAuthErrorAlertProps = {
  message: string;
  title?: string;
};

export function AdminAuthErrorAlert({
  message,
  title = 'Authentication error',
}: AdminAuthErrorAlertProps) {
  return (
    <div className="admin-auth-error" role="alert">
      <span className="admin-auth-error-icon" aria-hidden="true">
        <AlertCircle />
      </span>
      <div>
        <p className="admin-auth-error-title">{title}</p>
        <p className="admin-auth-error-message">{message}</p>
      </div>
    </div>
  );
}
