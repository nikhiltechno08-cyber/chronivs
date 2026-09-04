export type AdminOrderSort = 'newest' | 'oldest' | 'highest_amount' | 'lowest_amount';

export type AdminOrderStatusFilter = 'all' | 'completed' | 'pending' | 'failed';

export type AdminOrderSummary = {
  totalOrders: number;
  completed: number;
  pending: number;
  failed: number;
  todaysOrders: number;
  todaysRevenue: number;
  currency: string;
};

export type AdminOrderListItem = {
  orderId: string;
  experienceUuid: string;
  customerName: string;
  email: string;
  occasion?: string | null;
  relationship?: string | null;
  template?: string | null;
  amount: number;
  currency: string;
  paymentStatus: string;
  experienceStatus?: string | null;
  checkoutStatus: string;
  paymentId?: string | null;
  experienceUrl?: string | null;
  published: boolean;
  createdAt: string;
};

export type AdminOrderPhoto = {
  uuid: string;
  url?: string | null;
  cloudinaryPublicId?: string | null;
  mediaType: string;
  altText?: string | null;
};

export type AdminOrderDetail = {
  orderId: string;
  experienceUuid: string;
  customerName: string;
  email: string;
  mobile: string;
  occasion?: string | null;
  relationship?: string | null;
  template?: string | null;
  templateSlug?: string | null;
  recipientName?: string | null;
  customMessage?: string | null;
  amount: number;
  discountAmount: number;
  total: number;
  currency: string;
  couponCode?: string | null;
  paymentStatus: string;
  checkoutStatus: string;
  experienceStatus?: string | null;
  paymentId?: string | null;
  paymentOrderId?: string | null;
  paymentProvider?: string | null;
  experienceUrl?: string | null;
  published: boolean;
  publishedAt?: string | null;
  photos: AdminOrderPhoto[];
  createdAt: string;
  updatedAt?: string | null;
};

export type AdminOrderFilterOptions = {
  occasions: string[];
  templates: string[];
};

export type AdminOrdersListResponse = {
  items: AdminOrderListItem[];
  total: number;
  page: number;
  pageSize: number;
  pages: number;
  summary: AdminOrderSummary;
  filterOptions: AdminOrderFilterOptions;
};

export type AdminOrdersQuery = {
  page?: number;
  pageSize?: number;
  q?: string;
  status?: AdminOrderStatusFilter;
  occasion?: string;
  template?: string;
  dateFrom?: string;
  dateTo?: string;
  sort?: AdminOrderSort;
};
