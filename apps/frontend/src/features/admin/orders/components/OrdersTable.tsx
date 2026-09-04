'use client';

import { Copy, ExternalLink, Eye, MoreHorizontal } from 'lucide-react';
import { useState } from 'react';

import type { AdminOrderListItem } from '../types';
import { copyToClipboard, formatAmount, formatDate, formatStatusLabel } from '../utils';

type OrdersTableProps = {
  orders: AdminOrderListItem[];
  onView: (orderId: string) => void;
};

function OrderActions({
  order,
  onView,
}: {
  order: AdminOrderListItem;
  onView: (orderId: string) => void;
}) {
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = async (label: string, value?: string | null) => {
    if (!value) return;
    const success = await copyToClipboard(value);
    if (success) {
      setCopied(label);
      window.setTimeout(() => setCopied(null), 1600);
    }
  };

  return (
    <div className="admin-order-actions">
      <button type="button" className="admin-order-action-btn" onClick={() => onView(order.orderId)}>
        <Eye aria-hidden="true" />
        View
      </button>
      <button
        type="button"
        className="admin-order-action-btn"
        disabled={!order.experienceUrl}
        onClick={() => void handleCopy('url', order.experienceUrl)}
      >
        <Copy aria-hidden="true" />
        {copied === 'url' ? 'Copied' : 'Copy URL'}
      </button>
      <button
        type="button"
        className="admin-order-action-btn"
        disabled={!order.paymentId}
        onClick={() => void handleCopy('payment', order.paymentId)}
      >
        <Copy aria-hidden="true" />
        {copied === 'payment' ? 'Copied' : 'Copy Payment ID'}
      </button>
      <button type="button" className="admin-order-action-btn is-muted" disabled title="Coming soon">
        <MoreHorizontal aria-hidden="true" />
        More
      </button>
      {order.experienceUrl ? (
        <a
          href={order.experienceUrl}
          className="admin-order-action-btn"
          target="_blank"
          rel="noopener noreferrer"
        >
          <ExternalLink aria-hidden="true" />
          Open
        </a>
      ) : null}
    </div>
  );
}

export function OrdersTable({ orders, onView }: OrdersTableProps) {
  return (
    <>
      <div className="admin-table-wrap admin-orders-table-wrap">
        <table className="admin-table admin-orders-table">
          <thead>
            <tr>
              <th scope="col">Order ID</th>
              <th scope="col">Customer Name</th>
              <th scope="col">Email</th>
              <th scope="col">Occasion</th>
              <th scope="col">Relationship</th>
              <th scope="col">Template</th>
              <th scope="col">Amount</th>
              <th scope="col">Payment Status</th>
              <th scope="col">Experience Status</th>
              <th scope="col">Purchase Date</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.orderId}>
                <td data-label="Order ID">
                  <code className="admin-code">{order.orderId.slice(0, 8)}…</code>
                </td>
                <td data-label="Customer Name">
                  <span className="admin-table-primary">{order.customerName}</span>
                </td>
                <td data-label="Email">{order.email}</td>
                <td data-label="Occasion">{order.occasion ?? '—'}</td>
                <td data-label="Relationship">{order.relationship ?? '—'}</td>
                <td data-label="Template">{order.template ?? '—'}</td>
                <td data-label="Amount">{formatAmount(order.amount, order.currency)}</td>
                <td data-label="Payment Status">
                  <span className="admin-payment-badge">{formatStatusLabel(order.paymentStatus)}</span>
                </td>
                <td data-label="Experience Status">
                  <span className="admin-published-badge">
                    {order.experienceStatus ? formatStatusLabel(order.experienceStatus) : '—'}
                  </span>
                </td>
                <td data-label="Purchase Date">{formatDate(order.createdAt)}</td>
                <td data-label="Actions">
                  <OrderActions order={order} onView={onView} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="admin-order-cards">
        {orders.map((order) => (
          <article key={order.orderId} className="admin-order-card">
            <div className="admin-order-card-head">
              <div>
                <p className="admin-order-card-label">Order</p>
                <code className="admin-code">{order.orderId.slice(0, 8)}…</code>
              </div>
              <span className="admin-payment-badge">{formatStatusLabel(order.paymentStatus)}</span>
            </div>
            <div className="admin-order-card-grid">
              <div>
                <span>Customer</span>
                <strong>{order.customerName}</strong>
              </div>
              <div>
                <span>Email</span>
                <strong>{order.email}</strong>
              </div>
              <div>
                <span>Occasion</span>
                <strong>{order.occasion ?? '—'}</strong>
              </div>
              <div>
                <span>Template</span>
                <strong>{order.template ?? '—'}</strong>
              </div>
              <div>
                <span>Amount</span>
                <strong>{formatAmount(order.amount, order.currency)}</strong>
              </div>
              <div>
                <span>Purchase Date</span>
                <strong>{formatDate(order.createdAt)}</strong>
              </div>
            </div>
            <OrderActions order={order} onView={onView} />
          </article>
        ))}
      </div>
    </>
  );
}
