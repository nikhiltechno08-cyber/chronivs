'use client';

import { Copy, ExternalLink, Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';

import { useAdminExperienceDetail } from '../hooks/use-admin-experience-detail';
import { copyToClipboard, formatDate } from '../utils';
import { ExperienceStatusBadge } from './ExperienceStatusBadge';

type ExperienceDrawerProps = {
  experienceId: string | null;
  onClose: () => void;
};

function DetailRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="admin-order-detail-row">
      <span>{label}</span>
      <strong>{value?.trim() ? value : '—'}</strong>
    </div>
  );
}

export function ExperienceDrawer({ experienceId, onClose }: ExperienceDrawerProps) {
  const { data, isLoading, isError } = useAdminExperienceDetail(experienceId);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    if (!experienceId) return undefined;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [experienceId, onClose]);

  if (!experienceId) return null;

  const handleCopy = async (key: string, value?: string | null) => {
    if (!value) return;
    const success = await copyToClipboard(value);
    if (success) {
      setCopied(key);
      window.setTimeout(() => setCopied(null), 1600);
    }
  };

  return (
    <div className="admin-order-drawer-root" role="presentation">
      <button
        type="button"
        className="admin-order-drawer-backdrop"
        aria-label="Close experience details"
        onClick={onClose}
      />
      <aside className="admin-order-drawer" aria-label="Experience details">
        <div className="admin-order-drawer-head">
          <div>
            <p className="admin-order-drawer-eyebrow">Experience details</p>
            <h2>{experienceId.slice(0, 8)}…</h2>
          </div>
          <button type="button" className="admin-order-drawer-close" onClick={onClose} aria-label="Close">
            <X aria-hidden="true" />
          </button>
        </div>

        {isLoading ? (
          <div className="admin-order-drawer-loading" role="status">
            <span className="admin-auth-loading-spinner" aria-hidden="true" />
            <span>Loading experience details…</span>
          </div>
        ) : null}

        {isError ? (
          <div className="admin-order-drawer-error" role="alert">
            Unable to load experience details. Please try again.
          </div>
        ) : null}

        {data ? (
          <div className="admin-order-drawer-body">
            <section className="admin-order-drawer-section">
              <h3>Overview</h3>
              <DetailRow label="Experience ID" value={data.experienceId} />
              <DetailRow label="Customer" value={data.customer} />
              <DetailRow label="Recipient" value={data.recipientName} />
              <DetailRow label="Email" value={data.customerEmail} />
              <DetailRow label="Occasion" value={data.occasion} />
              <DetailRow label="Relationship" value={data.relationship} />
              <DetailRow label="Template" value={data.template} />
              <div className="admin-order-detail-row">
                <span>Status</span>
                <strong>
                  <ExperienceStatusBadge status={data.status} />
                </strong>
              </div>
              <DetailRow label="Personal Message" value={data.personalMessage} />
              <DetailRow label="Published URL" value={data.publishedUrl} />
              <DetailRow label="Created Date" value={formatDate(data.createdAt)} />
              <DetailRow label="Payment Reference" value={data.paymentReference} />
            </section>

            {data.photos.length > 0 ? (
              <section className="admin-order-drawer-section">
                <h3>Uploaded Photos</h3>
                <div className="admin-order-photo-grid">
                  {data.photos.map((photo) => (
                    <a
                      key={photo.uuid}
                      href={photo.url ?? '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="admin-order-photo-card"
                    >
                      {photo.url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={photo.url} alt={photo.altText ?? 'Experience photo'} />
                      ) : (
                        <span>No preview</span>
                      )}
                      {photo.cloudinaryPublicId ? (
                        <code>{photo.cloudinaryPublicId}</code>
                      ) : null}
                    </a>
                  ))}
                </div>
              </section>
            ) : null}

            <div className="admin-order-drawer-actions">
              {data.publishedUrl ? (
                <a
                  href={data.publishedUrl}
                  className="admin-order-drawer-action"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink aria-hidden="true" />
                  Open Experience
                </a>
              ) : null}
              <button
                type="button"
                className="admin-order-drawer-action"
                disabled={!data.publishedUrl}
                onClick={() => void handleCopy('link', data.publishedUrl)}
              >
                <Copy aria-hidden="true" />
                {copied === 'link' ? 'Copied' : 'Copy Link'}
              </button>
              <button
                type="button"
                className="admin-order-drawer-action"
                onClick={() => void handleCopy('id', data.experienceId)}
              >
                <Copy aria-hidden="true" />
                {copied === 'id' ? 'Copied' : 'Copy Experience ID'}
              </button>
              <button type="button" className="admin-order-drawer-action is-muted" disabled title="Coming soon">
                <Trash2 aria-hidden="true" />
                Delete
              </button>
            </div>
          </div>
        ) : null}
      </aside>
    </div>
  );
}
