'use client';

import { Copy, Eye } from 'lucide-react';
import { useState } from 'react';

import { normalizeGatewayLabel } from '../payment-display';
import type { AdminPaymentListItem } from '../types';
import { copyToClipboard, formatAmount, formatDate } from '../utils';
import { PaymentStatusBadge } from './PaymentStatusBadge';

type PaymentTableProps = {
  payments: AdminPaymentListItem[];
  onView: (recordId: string) => void;
};

function PaymentActions({
  payment,
  onView,
}: {
  payment: AdminPaymentListItem;
  onView: (recordId: string) => void;
}) {
  const [copied, setCopied] = useState(false);
  const reference = payment.paymentId ?? payment.recordId;

  const handleCopy = async () => {
    const success = await copyToClipboard(reference);
    if (success) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    }
  };

  return (
    <div className="admin-order-actions">
      <button type="button" className="admin-order-action-btn" onClick={() => onView(payment.recordId)}>
        <Eye aria-hidden="true" />
        View
      </button>
      <button type="button" className="admin-order-action-btn" onClick={() => void handleCopy()}>
        <Copy aria-hidden="true" />
        {copied ? 'Copied' : 'Copy ID'}
      </button>
    </div>
  );
}

export function PaymentTable({ payments, onView }: PaymentTableProps) {
  return (
    <>
      <div className="admin-table-wrap admin-payments-table-wrap">
        <table className="admin-table admin-payments-table">
          <thead>
            <tr>
              <th scope="col">Payment ID</th>
              <th scope="col">Order ID</th>
              <th scope="col">Customer</th>
              <th scope="col">Amount</th>
              <th scope="col">Currency</th>
              <th scope="col">Payment Method</th>
              <th scope="col">Status</th>
              <th scope="col">Gateway</th>
              <th scope="col">Created Date</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((payment) => (
              <tr key={payment.recordId}>
                <td data-label="Payment ID">
                  <code className="admin-code">
                    {payment.paymentId ? `${payment.paymentId.slice(0, 12)}…` : `#${payment.recordId}`}
                  </code>
                </td>
                <td data-label="Order ID">
                  <code className="admin-code">
                    {payment.orderId ? `${payment.orderId.slice(0, 8)}…` : '—'}
                  </code>
                </td>
                <td data-label="Customer">
                  <span className="admin-table-primary">{payment.customer}</span>
                  {payment.customerEmail ? (
                    <span className="admin-table-secondary">{payment.customerEmail}</span>
                  ) : null}
                </td>
                <td data-label="Amount">{formatAmount(payment.amount, payment.currency)}</td>
                <td data-label="Currency">{payment.currency}</td>
                <td data-label="Payment Method">{payment.paymentMethod ?? '—'}</td>
                <td data-label="Status">
                  <PaymentStatusBadge status={payment.status} />
                </td>
                <td data-label="Gateway">
                  <span className="admin-payment-gateway-badge">
                    {normalizeGatewayLabel(payment.provider, payment.gateway)}
                  </span>
                </td>
                <td data-label="Created Date">{formatDate(payment.createdAt)}</td>
                <td data-label="Actions">
                  <PaymentActions payment={payment} onView={onView} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="admin-payment-cards">
        {payments.map((payment) => (
          <article key={payment.recordId} className="admin-order-card admin-payment-card">
            <div className="admin-order-card-head">
              <div>
                <p className="admin-order-card-label">Payment</p>
                <code className="admin-code">
                  {payment.paymentId ? `${payment.paymentId.slice(0, 12)}…` : `#${payment.recordId}`}
                </code>
              </div>
              <PaymentStatusBadge
                status={payment.status}
                provider={payment.provider}
                gateway={payment.gateway}
                showGateway
              />
            </div>
            <div className="admin-order-card-grid">
              <div>
                <span>Customer</span>
                <strong>{payment.customer}</strong>
              </div>
              <div>
                <span>Amount</span>
                <strong>{formatAmount(payment.amount, payment.currency)}</strong>
              </div>
              <div>
                <span>Gateway</span>
                <strong>{normalizeGatewayLabel(payment.provider, payment.gateway)}</strong>
              </div>
              <div>
                <span>Created</span>
                <strong>{formatDate(payment.createdAt)}</strong>
              </div>
            </div>
            <PaymentActions payment={payment} onView={onView} />
          </article>
        ))}
      </div>
    </>
  );
}
