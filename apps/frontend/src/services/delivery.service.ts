/**
 * Delivery / email status API for published experiences.
 */

import { api } from '@/services/api-client';

export type DeliveryStatus = {
  status: 'email_sent' | 'pending' | 'failed' | string;
  email_sent: boolean;
  pending: boolean;
  failed: boolean;
  recipient_email?: string | null;
  provider?: string | null;
  message_id?: string | null;
  sent_at?: string | null;
  error?: string | null;
  retry_count: number;
  last_retry: number;
  email_type?: string;
  retried?: boolean;
};

export async function getDeliveryStatus(experienceId: string): Promise<DeliveryStatus> {
  return api.get<DeliveryStatus>(
    `/experiences/${encodeURIComponent(experienceId)}/delivery-status`,
  );
}

export async function retryDelivery(experienceId: string): Promise<DeliveryStatus> {
  return api.post<DeliveryStatus>(
    `/experiences/${encodeURIComponent(experienceId)}/delivery-retry`,
    {},
  );
}
