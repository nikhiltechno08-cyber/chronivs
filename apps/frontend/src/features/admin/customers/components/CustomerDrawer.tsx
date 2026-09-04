'use client';

import Link from 'next/link';
import { Copy, ExternalLink, ShoppingBag, X } from 'lucide-react';
import { useEffect, useState } from 'react';

import { ADMIN_ROUTES } from '@/features/admin/constants/routes';
import { useAdminCustomerDetail } from '../hooks/use-admin-customer-detail';
import { copyToClipboard, formatAmount, formatDate, formatStatusLabel } from '../utils';

type CustomerDrawerProps = {
  email: string | null;
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

export function CustomerDrawer({ email, onClose }: CustomerDrawerProps) {
  const { data, isLoading, isError } = useAdminCustomerDetail(email);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    if (!email) return undefined;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [email, onClose]);

  if (!email) return null;

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
      <button type="button" className="admin-order-drawer-backdrop" aria-label="Close customer details" onClick={onClose} />
      <aside className="admin-order-drawer" aria-label="Customer details">
        <div className="admin-order-drawer-head">
          <div>
            <p className="admin-order-drawer-eyebrow">Customer profile</p>
            <h2>{data?.customerName ?? email}</h2>
          </div>
          <button type="button" className="admin-order-drawer-close" onClick={onClose} aria-label="Close">
            <X aria-hidden="true" />
          </button>
        </div>

        {isLoading ? (
          <div className="admin-order-drawer-loading" role="status">
            <span className="admin-auth-loading-spinner" aria-hidden="true" />
            <span>Loading customer details…</span>
          </div>
        ) : null}

        {isError ? (
          <div className="admin-order-drawer-error" role="alert">
            Unable to load customer details. Please try again.
          </div>
        ) : null}

        {data ? (
          <div className="admin-order-drawer-body">
            <section className="admin-order-drawer-section">
              <h3>Customer Information</h3>
              <DetailRow label="Name" value={data.customerName} />
              <DetailRow label="Email" value={data.email} />
              <DetailRow label="Phone" value={data.phone} />
              <DetailRow label="Joined Date" value={formatDate(data.joinedAt)} />
            </section>

            <section className="admin-order-drawer-section">
              <h3>Purchase History</h3>
              <DetailRow label="Total Orders" value={String(data.totalOrders)} />
              <DetailRow label="Total Spend" value={formatAmount(data.totalSpent, data.currency)} />
              <DetailRow
                label="Latest Order"
                value={data.latestOrderId ? `${data.latestOrderId.slice(0, 8)}…` : undefined}
              />
              <DetailRow
                label="Latest Purchase"
                value={data.latestPurchase ? formatDate(data.latestPurchase) : undefined}
              />
              <DetailRow label="Uploaded Images Count" value={String(data.uploadedImagesCount)} />
            </section>

            {data.purchaseHistory.length > 0 ? (
              <section className="admin-order-drawer-section">
                <h3>Orders</h3>
                <div className="admin-customer-history-list">
                  {data.purchaseHistory.map((order) => (
                    <div key={order.orderId} className="admin-customer-history-item">
                      <div>
                        <code className="admin-code">{order.orderId.slice(0, 8)}…</code>
                        <p>{order.template ?? order.occasion ?? 'Experience order'}</p>
                      </div>
                      <div className="admin-customer-history-meta">
                        <span>{formatAmount(order.amount, order.currency)}</span>
                        <span className="admin-payment-badge">
                          {formatStatusLabel(order.paymentStatus)}
                        </span>
                        <span>{formatDate(order.createdAt)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ) : null}

            {data.experiences.length > 0 ? (
              <section className="admin-order-drawer-section">
                <h3>Generated Experiences</h3>
                <div className="admin-customer-history-list">
                  {data.experiences.map((experience) => (
                    <div key={experience.id} className="admin-customer-history-item">
                      <div>
                        <strong>{experience.name}</strong>
                        <p>{experience.published ? 'Published' : 'Draft'}</p>
                      </div>
                      {experience.publicUrl ? (
                        <a
                          href={experience.publicUrl}
                          className="admin-table-link"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Open
                        </a>
                      ) : null}
                    </div>
                  ))}
                </div>
              </section>
            ) : null}

            {data.paymentHistory.length > 0 ? (
              <section className="admin-order-drawer-section">
                <h3>Payment History</h3>
                <div className="admin-customer-history-list">
                  {data.paymentHistory.map((payment, index) => (
                    <div key={`${payment.paymentId ?? 'payment'}-${index}`} className="admin-customer-history-item">
                      <div>
                        <strong>{payment.paymentId ?? 'Payment'}</strong>
                        <p>{payment.provider ?? 'Provider unknown'}</p>
                      </div>
                      <div className="admin-customer-history-meta">
                        <span>{formatAmount(payment.amount, payment.currency)}</span>
                        <span className="admin-payment-badge">{formatStatusLabel(payment.status)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ) : null}

            <section className="admin-order-drawer-section admin-customer-notes">
              <h3>Notes</h3>
              <p>Customer notes will be available in a future release.</p>
            </section>

            <div className="admin-order-drawer-actions">
              <button
                type="button"
                className="admin-order-drawer-action"
                onClick={() => void handleCopy('email', data.email)}
              >
                <Copy aria-hidden="true" />
                {copied === 'email' ? 'Copied' : 'Copy Email'}
              </button>
              {data.latestExperienceUrl ? (
                <a
                  href={data.latestExperienceUrl}
                  className="admin-order-drawer-action"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink aria-hidden="true" />
                  Open Latest Experience
                </a>
              ) : null}
              {data.latestOrderId ? (
                <Link
                  href={`${ADMIN_ROUTES.orders}?q=${encodeURIComponent(data.latestOrderId)}`}
                  className="admin-order-drawer-action"
                >
                  <ShoppingBag aria-hidden="true" />
                  View Latest Order
                </Link>
              ) : null}
            </div>
          </div>
        ) : null}
      </aside>
    </div>
  );
}
