/** Shared domain types used across frontend and backend */

export type ApiResponse<T> = {
  data: T;
  message?: string;
};

export type ApiError = {
  error: string;
  code: string;
  details?: Record<string, unknown>;
};

export type PaginatedResponse<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
};

export type ExperienceStatus = 'draft' | 'published' | 'archived';

export type TemplateCategory =
  | 'birthday'
  | 'proposal'
  | 'anniversary'
  | 'celebration'
  | 'custom';
