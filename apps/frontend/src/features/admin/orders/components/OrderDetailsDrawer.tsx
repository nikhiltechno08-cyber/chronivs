'use client';

import { Copy, Download, ExternalLink, X } from 'lucide-react';
import { useEffect, useState } from 'react';

import { useAdminOrderDetail } from '../hooks/use-admin-order-detail';
import { copyToClipboard, formatAmount, formatDate, formatStatusLabel } from '../utils';

type OrderDetailsDrawerProps = {
  orderId: string | null;
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

export function OrderDetailsDrawer({ orderId, onClose }: OrderDetailsDrawerProps) {
  const { data, isLoading, isError } = useAdminOrderDetail(orderId);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) return undefined;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [onClose, orderId]);

  if (!orderId) return null;

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
      <button type="button" className="admin-order-drawer-backdrop" aria-label="Close order details" onClick={onClose} />
      <aside className="admin-order-drawer" aria-label="Order details">
        <div className="admin-order-drawer-head">
          <div>
            <p className="admin-order-drawer-eyebrow">Order details</p>
            <h2>{orderId.slice(0, 8)}…</h2>
          </div>
          <button type="button" className="admin-order-drawer-close" onClick={onClose} aria-label="Close">
            <X aria-hidden="true" />
          </button>
        </div>

        {isLoading ? (
          <div className="admin-order-drawer-loading" role="status">
            <span className="admin-auth-loading-spinner" aria-hidden="true" />
            <span>Loading order details…</span>
          </div>
        ) : null}

        {isError ? (
          <div className="admin-order-drawer-error" role="alert">
            Unable to load order details. Please try again.
          </div>
        ) : null}

        {data ? (
          <div className="admin-order-drawer-body">
            <section className="admin-order-drawer-section">
              <h3>Customer</h3>
              <DetailRow label="Customer" value={data.customerName} />
              <DetailRow label="Email" value={data.email} />
              <DetailRow label="Mobile" value={data.mobile} />
              <DetailRow label="Recipient Name" value={data.recipientName} />
            </section>

            <section className="admin-order-drawer-section">
              <h3>Experience</h3>
              <DetailRow label="Occasion" value={data.occasion} />
              <DetailRow label="Relationship" value={data.relationship} />
              <DetailRow label="Template" value={data.template} />
              <DetailRow label="Custom Message" value={data.customMessage} />
              <DetailRow
                label="Published Status"
                value={data.published ? 'Published' : 'Not published'}
              />
            </section>

            <section className="admin-order-drawer-section">
              <h3>Payment</h3>
              <DetailRow label="Amount" value={formatAmount(data.total, data.currency)} />
              <DetailRow label="Payment Status" value={formatStatusLabel(data.paymentStatus)} />
              <DetailRow label="Payment ID" value={data.paymentId} />
              <DetailRow label="Gateway Order ID" value={data.paymentOrderId} />
              <DetailRow label="Provider" value={data.paymentProvider} />
              <DetailRow label="Created Date" value={formatDate(data.createdAt)} />
            </section>

            <section className="admin-order-drawer-section">
              <h3>Links</h3>
              <DetailRow label="Order ID" value={data.orderId} />
              <DetailRow label="Experience URL" value={data.experienceUrl} />
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
              <button
                type="button"
                className="admin-order-drawer-action"
                disabled={!data.experienceUrl}
                onClick={() => void handleCopy('experience', data.experienceUrl)}
              >
                <Copy aria-hidden="true" />
                {copied === 'experience' ? 'Copied' : 'Copy Experience Link'}
              </button>
              {data.experienceUrl ? (
                <a
                  href={data.experienceUrl}
                  className="admin-order-drawer-action"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink aria-hidden="true" />
                  Open Experience
                </a>
              ) : null}
              <button type="button" className="admin-order-drawer-action is-muted" disabled title="Coming soon">
                <Download aria-hidden="true" />
                Download JSON
              </button>
            </div>
          </div>
        ) : null}
      </aside>
    </div>
  );
}
