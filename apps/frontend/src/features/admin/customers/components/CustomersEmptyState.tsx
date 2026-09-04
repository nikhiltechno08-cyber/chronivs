import { Users } from 'lucide-react';

import { AdminEmptyState } from '@/features/admin/components/AdminEmptyState';

export function CustomersEmptyState() {
  return (
    <AdminEmptyState
      icon={Users}
      title="No customers yet"
      description="No customers found."
    />
  );
}
