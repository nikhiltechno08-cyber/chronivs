import { getAdminApiBase } from '@/features/admin/constants/api';

import type { AdminSettingsData } from './types';

type SettingsApiResponse = {
  general: {
    platform_name: string;
    platform_version: string;
    environment: string;
  };
  cloudinary: {
    cloud_name?: string | null;
    upload_status: string;
    connection_status: string;
  };
  payment: {
    current_gateway: string;
    mock_enabled: boolean;
    razorpay_ready: boolean;
    connection_status: string;
    webhook_status: string;
  };
  email: {
    smtp_status: string;
    queue_status: string;
  };
  security: {
    current_admin: string;
    last_login?: string | null;
    session_timeout_hours: number;
  };
  maintenance: {
    maintenance_mode: boolean;
    read_only_mode: boolean;
  };
  system_health: Array<{ label: string; status: string }>;
  backup: { future_features: string[] };
  about: {
    chronivs_version: string;
    build_version: string;
    deployment_environment: string;
  };
};

function mapSettingsResponse(payload: SettingsApiResponse): AdminSettingsData {
  return {
    general: {
      platformName: payload.general.platform_name,
      platformVersion: payload.general.platform_version,
      environment: payload.general.environment,
    },
    cloudinary: {
      cloudName: payload.cloudinary.cloud_name ?? null,
      uploadStatus: payload.cloudinary.upload_status,
      connectionStatus: payload.cloudinary.connection_status,
    },
    payment: {
      currentGateway: payload.payment.current_gateway,
      mockEnabled: payload.payment.mock_enabled,
      razorpayReady: payload.payment.razorpay_ready,
      connectionStatus: payload.payment.connection_status,
      webhookStatus: payload.payment.webhook_status,
    },
    email: {
      smtpStatus: payload.email.smtp_status,
      queueStatus: payload.email.queue_status,
    },
    security: {
      currentAdmin: payload.security.current_admin,
      lastLogin: payload.security.last_login ?? null,
      sessionTimeoutHours: payload.security.session_timeout_hours,
    },
    maintenance: {
      maintenanceMode: payload.maintenance.maintenance_mode,
      readOnlyMode: payload.maintenance.read_only_mode,
    },
    systemHealth: (payload.system_health ?? []).map((item) => ({
      label: item.label,
      status: item.status,
    })),
    backup: {
      futureFeatures: payload.backup.future_features ?? [],
    },
    about: {
      chronivsVersion: payload.about.chronivs_version,
      buildVersion: payload.about.build_version,
      deploymentEnvironment: payload.about.deployment_environment,
    },
  };
}

export async function fetchAdminSettings(): Promise<AdminSettingsData> {
  const response = await fetch(`${getAdminApiBase()}/admin/settings`, {
    method: 'GET',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    throw new Error('Unable to load admin settings');
  }

  const payload = (await response.json()) as SettingsApiResponse;
  return mapSettingsResponse(payload);
}

export const SettingsService = {
  fetch: fetchAdminSettings,
};
