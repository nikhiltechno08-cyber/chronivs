import { cn } from '@chronivs/ui';

import type { NormalizedPaymentStatus } from '../types';
import { isMockGateway, normalizeGatewayLabel } from '../payment-display';

type PaymentStatusBadgeProps = {
  status: NormalizedPaymentStatus | string;
  provider?: string | null;
  gateway?: string | null;
  showGateway?: boolean;
};

const STATUS_LABELS: Record<string, string> = {
  success: 'Success',
  pending: 'Pending',
  failed: 'Failed',
  refunded: 'Refunded',
};

export function PaymentStatusBadge({
  status,
  provider,
  gateway,
  showGateway = false,
}: PaymentStatusBadgeProps) {
  const normalized = status.toLowerCase();
  const label = STATUS_LABELS[normalized] ?? normalized.replace(/_/g, ' ');

  return (
    <span className="admin-payment-status-badges">
      <span className={cn('admin-payment-status-badge', `is-${normalized}`)}>{label}</span>
      {showGateway && isMockGateway(provider, gateway) ? (
        <span className="admin-payment-gateway-badge is-mock">
          {normalizeGatewayLabel(provider, gateway)}
        </span>
      ) : null}
      {showGateway && !isMockGateway(provider, gateway) && gateway ? (
        <span className="admin-payment-gateway-badge">{normalizeGatewayLabel(provider, gateway)}</span>
      ) : null}
    </span>
  );
}
