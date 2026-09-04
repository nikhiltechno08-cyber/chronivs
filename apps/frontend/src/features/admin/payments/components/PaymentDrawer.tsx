'use client';

import { Copy, ExternalLink, RotateCcw, X } from 'lucide-react';
import { useEffect, useState } from 'react';

import { normalizeGatewayLabel } from '../payment-display';
import { useAdminPaymentDetail } from '../hooks/use-admin-payment-detail';
import { copyToClipboard, formatAmount, formatDate } from '../utils';
import { PaymentStatusBadge } from './PaymentStatusBadge';

type PaymentDrawerProps = {
  recordId: string | null;
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

export function PaymentDrawer({ recordId, onClose }: PaymentDrawerProps) {
  const { data, isLoading, isError } = useAdminPaymentDetail(recordId);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    if (!recordId) return undefined;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [onClose, recordId]);

  if (!recordId) return null;

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
      <button type="button" className="admin-order-drawer-backdrop" aria-label="Close payment details" onClick={onClose} />
      <aside className="admin-order-drawer" aria-label="Payment details">
        <div className="admin-order-drawer-head">
          <div>
            <p className="admin-order-drawer-eyebrow">Payment details</p>
            <h2>{data?.paymentId ? `${data.paymentId.slice(0, 12)}…` : `#${recordId}`}</h2>
          </div>
          <button type="button" className="admin-order-drawer-close" onClick={onClose} aria-label="Close">
            <X aria-hidden="true" />
          </button>
        </div>

        {isLoading ? (
          <div className="admin-order-drawer-loading" role="status">
            <span className="admin-auth-loading-spinner" aria-hidden="true" />
            <span>Loading payment details…</span>
          </div>
        ) : null}

        {isError ? (
          <div className="admin-order-drawer-error" role="alert">
            Unable to load payment details. Please try again.
          </div>
        ) : null}

        {data ? (
          <div className="admin-order-drawer-body">
            <section className="admin-order-drawer-section">
              <h3>Payment</h3>
              <DetailRow label="Payment ID" value={data.paymentId ?? `#${data.recordId}`} />
              <DetailRow label="Order ID" value={data.orderId} />
              <DetailRow label="Customer" value={data.customer} />
              <DetailRow label="Email" value={data.customerEmail} />
              <DetailRow label="Amount" value={formatAmount(data.amount, data.currency)} />
              <DetailRow label="Gateway" value={normalizeGatewayLabel(data.provider, data.gateway)} />
              <div className="admin-order-detail-row">
                <span>Status</span>
                <strong>
                  <PaymentStatusBadge
                    status={data.status}
                    provider={data.provider}
                    gateway={data.gateway}
                    showGateway
                  />
                </strong>
              </div>
              <DetailRow label="Payment Method" value={data.paymentMethod} />
              <DetailRow label="Transaction Reference" value={data.transactionReference} />
              <DetailRow label="Created" value={formatDate(data.createdAt)} />
              {data.failureReason ? (
                <DetailRow label="Failure Reason" value={data.failureReason} />
              ) : null}
            </section>

            <section className="admin-order-drawer-section">
              <h3>Experience</h3>
              <DetailRow label="Experience" value={data.experienceName} />
              <DetailRow label="Experience ID" value={data.experienceId} />
              <DetailRow label="Published URL" value={data.experienceUrl} />
            </section>

            <section className="admin-order-drawer-section admin-customer-notes">
              <h3>Refund</h3>
              <p>Refund processing will be available in a future release.</p>
            </section>

            <div className="admin-order-drawer-actions">
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
              <button
                type="button"
                className="admin-order-drawer-action"
                onClick={() => void handleCopy('payment', data.paymentId ?? data.recordId)}
              >
                <Copy aria-hidden="true" />
                {copied === 'payment' ? 'Copied' : 'Copy Payment ID'}
              </button>
              <button
                type="button"
                className="admin-order-drawer-action"
                disabled={!data.transactionReference}
                onClick={() => void handleCopy('reference', data.transactionReference)}
              >
                <Copy aria-hidden="true" />
                {copied === 'reference' ? 'Copied' : 'Copy Reference'}
              </button>
              <button type="button" className="admin-order-drawer-action is-muted" disabled title="Coming soon">
                <RotateCcw aria-hidden="true" />
                Refund
              </button>
            </div>
          </div>
        ) : null}
      </aside>
    </div>
  );
}
