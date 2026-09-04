export type AdminSearchEntityType = 'order' | 'customer' | 'experience' | 'payment';

export type AdminSearchIntent =
  | 'general'
  | 'order_id'
  | 'payment_id'
  | 'experience_id'
  | 'email'
  | 'name'
  | 'occasion'
  | 'template';

export type AdminSearchResultItem = {
  entityType: AdminSearchEntityType;
  referenceId: string;
  title: string;
  subtitle: string;
  status: string;
};

export type AdminSearchGroup = {
  entityType: AdminSearchEntityType;
  label: string;
  items: AdminSearchResultItem[];
};

export type AdminSearchResponse = {
  query: string;
  groups: AdminSearchGroup[];
  total: number;
};

export type AdminSearchQuery = {
  q: string;
  limit?: number;
  intent?: AdminSearchIntent;
};
