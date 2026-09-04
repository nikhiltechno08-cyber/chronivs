export type AdminPaymentSort = 'newest' | 'oldest' | 'highest_amount' | 'lowest_amount';

export type AdminPaymentStatusFilter = 'all' | 'success' | 'pending' | 'failed' | 'refunded';

export type NormalizedPaymentStatus = 'success' | 'pending' | 'failed' | 'refunded';

export type AdminPaymentSummary = {
  totalRevenue: number;
  todaysRevenue: number;
  successfulPayments: number;
  pendingPayments: number;
  failedPayments: number;
  refundedPayments: number;
  currency: string;
};

export type AdminPaymentListItem = {
  recordId: string;
  paymentId?: string | null;
  orderId?: string | null;
  customer: string;
  customerEmail?: string | null;
  amount: number;
  currency: string;
  paymentMethod?: string | null;
  status: NormalizedPaymentStatus;
  rawStatus: string;
  gateway: string;
  provider?: string | null;
  experienceId?: string | null;
  createdAt: string;
};

export type AdminPaymentDetail = {
  recordId: string;
  paymentId?: string | null;
  orderId?: string | null;
  customer: string;
  customerEmail?: string | null;
  amount: number;
  currency: string;
  paymentMethod?: string | null;
  status: NormalizedPaymentStatus;
  rawStatus: string;
  gateway: string;
  provider?: string | null;
  transactionReference?: string | null;
  failureReason?: string | null;
  experienceId?: string | null;
  experienceName?: string | null;
  experienceUrl?: string | null;
  verifiedAt?: string | null;
  createdAt: string;
};

export type AdminPaymentsListResponse = {
  items: AdminPaymentListItem[];
  total: number;
  page: number;
  pageSize: number;
  pages: number;
  summary: AdminPaymentSummary;
  filterOptions: { gateways: string[] };
  activeProvider?: string | null;
};

export type AdminPaymentsQuery = {
  page?: number;
  pageSize?: number;
  q?: string;
  status?: AdminPaymentStatusFilter;
  gateway?: string;
  dateFrom?: string;
  dateTo?: string;
  sort?: AdminPaymentSort;
};
