'use client';

import { useSearchParams } from 'next/navigation';
import { useState, type FormEvent } from 'react';

import { ADMIN_ROUTES } from '../constants/routes';
import { useAdminAuth } from './use-admin-auth';
import { AdminAuthErrorAlert } from './AdminAuthErrorAlert';
import { getAdminAuthErrorMessage } from './admin-auth-service';

export function AdminLoginForm() {
  const searchParams = useSearchParams();
  const { login } = useAdminAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await login(email.trim(), password);
      const nextPath = searchParams.get('next');
      const destination =
        nextPath && nextPath.startsWith('/admin/') ? nextPath : ADMIN_ROUTES.dashboard;
      window.location.assign(destination);
      return;
    } catch (submitError) {
      setError(getAdminAuthErrorMessage(submitError));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="admin-login-form" onSubmit={(event) => void handleSubmit(event)} noValidate>
      {error ? <AdminAuthErrorAlert message={error} title="Sign in failed" /> : null}

      <label className="admin-login-field">
        <span>Email</span>
        <input
          type="email"
          name="email"
          autoComplete="username"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="admin@gmail.com"
          required
          disabled={isSubmitting}
        />
      </label>

      <label className="admin-login-field">
        <span>Password</span>
        <input
          type="password"
          name="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Enter your password"
          required
          minLength={3}
          disabled={isSubmitting}
        />
      </label>

      <button type="submit" className="admin-login-submit" disabled={isSubmitting}>
        {isSubmitting ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  );
}
