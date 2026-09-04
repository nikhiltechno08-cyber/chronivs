/**
 * Gateway-agnostic payment display helpers for the admin UI.
 * Never import Razorpay or other gateway SDKs here.
 */

const GATEWAY_LABELS: Record<string, string> = {
  mock: 'Mock',
  razorpay: 'Razorpay',
};

export function normalizeGatewayLabel(provider?: string | null, gateway?: string | null): string {
  if (gateway?.trim()) {
    return gateway;
  }
  if (!provider?.trim()) {
    return 'Unknown';
  }
  return GATEWAY_LABELS[provider.toLowerCase()] ?? provider;
}

export function isMockGateway(provider?: string | null, gateway?: string | null): boolean {
  const source = (provider ?? gateway ?? '').toLowerCase();
  return source === 'mock';
}

export function formatGatewayFilterLabel(provider: string): string {
  return GATEWAY_LABELS[provider.toLowerCase()] ?? provider;
}
