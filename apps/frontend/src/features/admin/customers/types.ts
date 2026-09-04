export type AdminCustomerSort =
  | 'newest'
  | 'oldest'
  | 'highest_spend'
  | 'latest_purchase'
  | 'most_orders';

export type AdminCustomerHasOrdersFilter = 'all' | 'paid' | 'unpaid';

export type AdminCustomerRepeatFilter = 'all' | 'repeat' | 'first_time';

export type AdminCustomerSummary = {
  totalCustomers: number;
  newThisMonth: number;
  repeatCustomers: number;
  totalRevenue: number;
  currency: string;
};

export type AdminCustomerListItem = {
  email: string;
  customerName: string;
  phone?: string | null;
  totalOrders: number;
  totalSpent: number;
  currency: string;
  latestPurchase?: string | null;
  joinedAt: string;
  isRepeat: boolean;
  latestOrderId?: string | null;
  latestExperienceUrl?: string | null;
};

export type AdminCustomerOrderHistoryItem = {
  orderId: string;
  amount: number;
  currency: string;
  paymentStatus: string;
  checkoutStatus: string;
  template?: string | null;
  occasion?: string | null;
  createdAt: string;
};

export type AdminCustomerPaymentHistoryItem = {
  paymentId?: string | null;
  orderId?: string | null;
  amount: number;
  currency: string;
  status: string;
  provider?: string | null;
  createdAt?: string | null;
};

export type AdminCustomerExperienceItem = {
  id: string;
  name: string;
  publicUrl?: string | null;
  published: boolean;
  publishedAt?: string | null;
  createdAt?: string | null;
};

export type AdminCustomerDetail = {
  email: string;
  customerName: string;
  phone?: string | null;
  joinedAt: string;
  totalOrders: number;
  totalSpent: number;
  currency: string;
  latestOrderId?: string | null;
  latestPurchase?: string | null;
  latestExperienceUrl?: string | null;
  uploadedImagesCount: number;
  purchaseHistory: AdminCustomerOrderHistoryItem[];
  paymentHistory: AdminCustomerPaymentHistoryItem[];
  experiences: AdminCustomerExperienceItem[];
};

export type AdminCustomersListResponse = {
  items: AdminCustomerListItem[];
  total: number;
  page: number;
  pageSize: number;
  pages: number;
  summary: AdminCustomerSummary;
};

export type AdminCustomersQuery = {
  page?: number;
  pageSize?: number;
  q?: string;
  hasOrders?: AdminCustomerHasOrdersFilter;
  repeatCustomer?: AdminCustomerRepeatFilter;
  dateFrom?: string;
  dateTo?: string;
  sort?: AdminCustomerSort;
};
