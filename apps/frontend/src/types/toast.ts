export type ToastVariant = 'default' | 'success' | 'error' | 'warning' | 'info';

export type ToastPayload = {
  id?: string;
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
};
