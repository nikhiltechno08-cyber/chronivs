import { CreditCard } from 'lucide-react';

import { AdminEmptyState } from '@/features/admin/components/AdminEmptyState';

export function PaymentsEmptyState() {
  return (
    <AdminEmptyState
      icon={CreditCard}
      title="No payments yet"
      description="No payments available."
    />
  );
}
