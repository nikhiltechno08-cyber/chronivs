import { getAdminPageMeta } from '../config/navigation';
import { type AdminPageKey } from '../constants/routes';
import { AdminEmptyState } from './AdminEmptyState';
import { AdminPageHeader } from './AdminPageHeader';

type AdminPlaceholderPageProps = {
  pageKey: AdminPageKey;
};

export function AdminPlaceholderPage({ pageKey }: AdminPlaceholderPageProps) {
  const meta = getAdminPageMeta(pageKey);
  const Icon = meta.icon;

  return (
    <div className="admin-page">
      <AdminPageHeader title={meta.label} description={meta.description} />
      <AdminEmptyState
        icon={Icon}
        title="Content coming soon"
        description="This admin section is ready for future business functionality. Data tables, filters, and actions will appear here."
      />
    </div>
  );
}
