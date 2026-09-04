'use client';

type AdminAuthLoaderProps = {
  message?: string;
};

export function AdminAuthLoader({ message = 'Verifying session…' }: AdminAuthLoaderProps) {
  return (
    <div className="admin-auth-screen" role="status" aria-live="polite">
      <div className="admin-auth-screen-inner">
        <div className="admin-auth-logo" aria-hidden="true">
          <span className="admin-auth-logo-mark">C</span>
          <span className="admin-auth-logo-word">Chronivs</span>
        </div>
        <div className="admin-auth-loader-ring" aria-hidden="true">
          <span />
        </div>
        <p className="admin-auth-screen-message">{message}</p>
      </div>
    </div>
  );
}
