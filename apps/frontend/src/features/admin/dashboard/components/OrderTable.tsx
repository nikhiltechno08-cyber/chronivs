import Link from 'next/link';

import { ADMIN_ROUTES } from '@/features/admin/constants/routes';

import type { AdminRecentOrder } from '../types';
import { DashboardEmptyState } from './DashboardEmptyState';

import { ShoppingBag } from 'lucide-react';

type OrderTableProps = {
  orders: AdminRecentOrder[];
};

function formatAmount(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function formatPaymentStatus(status: string): string {
  return status.replace(/_/g, ' ');
}

export function OrderTable({ orders }: OrderTableProps) {
  if (orders.length === 0) {
    return (
      <DashboardEmptyState
        icon={ShoppingBag}
        title="No orders yet"
        description="No experiences have been purchased yet."
      />
    );
  }

  return (
    <div className="admin-table-wrap">
      <table className="admin-table">
        <thead>
          <tr>
            <th scope="col">Order ID</th>
            <th scope="col">Customer</th>
            <th scope="col">Occasion</th>
            <th scope="col">Template</th>
            <th scope="col">Amount</th>
            <th scope="col">Payment Status</th>
            <th scope="col">Created</th>
            <th scope="col">
              <span className="sr-only">View</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.orderId}>
              <td data-label="Order ID">
                <code className="admin-code">{order.orderId.slice(0, 8)}…</code>
              </td>
              <td data-label="Customer">
                <span className="admin-table-primary">{order.customer}</span>
                {order.customerEmail ? (
                  <span className="admin-table-secondary">{order.customerEmail}</span>
                ) : null}
              </td>
              <td data-label="Occasion">{order.occasion ?? '—'}</td>
              <td data-label="Template">{order.template ?? '—'}</td>
              <td data-label="Amount">{formatAmount(order.amount, order.currency)}</td>
              <td data-label="Payment Status">
                <span className="admin-payment-badge">{formatPaymentStatus(order.paymentStatus)}</span>
              </td>
              <td data-label="Created">{formatDate(order.createdAt)}</td>
              <td data-label="View">
                <Link href={ADMIN_ROUTES.orders} className="admin-table-link">
                  View
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
