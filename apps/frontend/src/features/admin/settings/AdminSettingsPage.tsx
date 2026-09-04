'use client';

import { AdminPageHeader } from '@/features/admin/components/AdminPageHeader';

import { useAdminSettings } from './hooks/use-admin-settings';
import { ConfigurationCard } from './components/ConfigurationCard';
import { SettingsSection } from './components/SettingsSection';
import { SystemStatusCard } from './components/SystemStatusCard';
import { buildBackupCard, buildSettingsCards } from './utils';

export function AdminSettingsPage() {
  const { data, isLoading, isError } = useAdminSettings();

  const cards = data ? buildSettingsCards(data) : [];
  const backupCard = data ? buildBackupCard(data) : null;
  const primaryCards = cards.filter((card) => card.id !== 'about');
  const aboutCard = cards.find((card) => card.id === 'about');

  return (
    <div className="admin-page admin-settings-page">
      <AdminPageHeader
        title="Settings"
        description="Configure Chronivs system settings."
      />

      {isLoading ? (
        <div className="admin-dashboard-loading" role="status" aria-live="polite">
          <span className="admin-auth-loading-spinner" aria-hidden="true" />
          <span>Loading settings…</span>
        </div>
      ) : isError || !data ? (
        <div className="admin-settings-error" role="alert">
          Unable to load settings. Please refresh and try again.
        </div>
      ) : (
        <>
          <SettingsSection title="Configuration" description="Review platform integrations and admin controls.">
            <div className="admin-settings-grid">
              {primaryCards.map((card) => (
                <ConfigurationCard key={card.id} card={card} />
              ))}
            </div>
          </SettingsSection>

          <SettingsSection title="System Health">
            <SystemStatusCard items={data.systemHealth} />
          </SettingsSection>

          {backupCard ? (
            <SettingsSection title="Backup">
              <div className="admin-settings-grid admin-settings-grid-single">
                <ConfigurationCard card={backupCard} />
              </div>
            </SettingsSection>
          ) : null}

          {aboutCard ? (
            <SettingsSection title="About">
              <div className="admin-settings-grid admin-settings-grid-single">
                <ConfigurationCard card={aboutCard} />
              </div>
            </SettingsSection>
          ) : null}
        </>
      )}
    </div>
  );
}
