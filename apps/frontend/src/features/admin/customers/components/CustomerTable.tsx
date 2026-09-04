'use client';

import { Eye } from 'lucide-react';

import type { AdminCustomerListItem } from '../types';
import { formatAmount, formatDate } from '../utils';

type CustomerTableProps = {
  customers: AdminCustomerListItem[];
  onView: (email: string) => void;
};

export function CustomerTable({ customers, onView }: CustomerTableProps) {
  return (
    <>
      <div className="admin-table-wrap admin-customers-table-wrap">
        <table className="admin-table admin-customers-table">
          <thead>
            <tr>
              <th scope="col">Customer Name</th>
              <th scope="col">Email</th>
              <th scope="col">Phone</th>
              <th scope="col">Total Orders</th>
              <th scope="col">Total Spent</th>
              <th scope="col">Latest Purchase</th>
              <th scope="col">Created Date</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer) => (
              <tr key={customer.email}>
                <td data-label="Customer Name">
                  <span className="admin-table-primary">{customer.customerName}</span>
                  {customer.isRepeat ? (
                    <span className="admin-table-secondary">Repeat customer</span>
                  ) : null}
                </td>
                <td data-label="Email">{customer.email}</td>
                <td data-label="Phone">{customer.phone ?? '—'}</td>
                <td data-label="Total Orders">{customer.totalOrders}</td>
                <td data-label="Total Spent">
                  {formatAmount(customer.totalSpent, customer.currency)}
                </td>
                <td data-label="Latest Purchase">
                  {customer.latestPurchase ? formatDate(customer.latestPurchase) : '—'}
                </td>
                <td data-label="Created Date">{formatDate(customer.joinedAt)}</td>
                <td data-label="Actions">
                  <button
                    type="button"
                    className="admin-order-action-btn"
                    onClick={() => onView(customer.email)}
                  >
                    <Eye aria-hidden="true" />
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="admin-customer-cards">
        {customers.map((customer) => (
          <article key={customer.email} className="admin-order-card admin-customer-card">
            <div className="admin-order-card-head">
              <div>
                <p className="admin-order-card-label">Customer</p>
                <strong>{customer.customerName}</strong>
              </div>
              <span className="admin-published-badge">
                {customer.totalOrders} order{customer.totalOrders === 1 ? '' : 's'}
              </span>
            </div>
            <div className="admin-order-card-grid">
              <div>
                <span>Email</span>
                <strong>{customer.email}</strong>
              </div>
              <div>
                <span>Phone</span>
                <strong>{customer.phone ?? '—'}</strong>
              </div>
              <div>
                <span>Total Spent</span>
                <strong>{formatAmount(customer.totalSpent, customer.currency)}</strong>
              </div>
              <div>
                <span>Latest Purchase</span>
                <strong>
                  {customer.latestPurchase ? formatDate(customer.latestPurchase) : '—'}
                </strong>
              </div>
              <div>
                <span>Joined</span>
                <strong>{formatDate(customer.joinedAt)}</strong>
              </div>
            </div>
            <button
              type="button"
              className="admin-order-action-btn"
              onClick={() => onView(customer.email)}
            >
              <Eye aria-hidden="true" />
              View
            </button>
          </article>
        ))}
      </div>
    </>
  );
}
