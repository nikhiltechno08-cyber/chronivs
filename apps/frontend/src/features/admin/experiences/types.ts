export type AdminExperienceSort = 'newest' | 'oldest';

export type AdminExperienceStatusFilter = 'all' | 'published' | 'draft' | 'expired';

export type AdminExperienceSummary = {
  published: number;
  draft: number;
  expired: number;
  total: number;
};

export type AdminExperiencePhoto = {
  uuid: string;
  url?: string | null;
  cloudinaryPublicId?: string | null;
  mediaType: string;
  altText?: string | null;
};

export type AdminExperienceListItem = {
  experienceId: string;
  customer: string;
  customerEmail?: string | null;
  occasion?: string | null;
  relationship?: string | null;
  template?: string | null;
  status: string;
  experienceStatus?: string | null;
  publishedUrl?: string | null;
  createdAt: string;
};

export type AdminExperienceDetail = {
  experienceId: string;
  customer: string;
  customerEmail?: string | null;
  recipientName?: string | null;
  occasion?: string | null;
  relationship?: string | null;
  template?: string | null;
  templateSlug?: string | null;
  personalMessage?: string | null;
  status: string;
  experienceStatus?: string | null;
  publishedUrl?: string | null;
  publicSlug?: string | null;
  paymentReference?: string | null;
  checkoutOrderId?: string | null;
  photos: AdminExperiencePhoto[];
  createdAt: string;
  publishedAt?: string | null;
};

export type AdminExperienceFilterOptions = {
  occasions: string[];
  relationships: string[];
  templates: string[];
};

export type AdminExperiencesListResponse = {
  items: AdminExperienceListItem[];
  total: number;
  page: number;
  pageSize: number;
  pages: number;
  summary: AdminExperienceSummary;
  filterOptions: AdminExperienceFilterOptions;
};

export type AdminExperiencesQuery = {
  page?: number;
  pageSize?: number;
  q?: string;
  occasion?: string;
  relationship?: string;
  template?: string;
  status?: AdminExperienceStatusFilter;
  dateFrom?: string;
  dateTo?: string;
  sort?: AdminExperienceSort;
};
