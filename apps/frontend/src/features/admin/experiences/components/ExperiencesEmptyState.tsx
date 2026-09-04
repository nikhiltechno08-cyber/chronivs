import { Sparkles } from 'lucide-react';

import { AdminEmptyState } from '@/features/admin/components/AdminEmptyState';

export function ExperiencesEmptyState() {
  return (
    <AdminEmptyState
      icon={Sparkles}
      title="No experiences yet"
      description="No experiences generated yet."
    />
  );
}
