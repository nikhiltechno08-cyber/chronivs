import type { AdminSettingsData, ConfigurationCardData } from './types';

function capitalize(value: string): string {
  if (!value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function formatLastLogin(value: string | null): string {
  if (!value) {
    return 'Not available';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

export function buildSettingsCards(data: AdminSettingsData): ConfigurationCardData[] {
  return [
    {
      id: 'general',
      title: 'General',
      description: 'Core platform identity and runtime environment.',
      fields: [
        { label: 'Platform Name', value: data.general.platformName },
        { label: 'Platform Version', value: data.general.platformVersion },
        { label: 'Environment', value: capitalize(data.general.environment) },
      ],
    },
    {
      id: 'cloudinary',
      title: 'Cloudinary',
      description: 'Media upload configuration and connection health.',
      fields: [
        { label: 'Cloud Name', value: data.cloudinary.cloudName ?? 'Not configured' },
        { label: 'Upload Status', value: data.cloudinary.uploadStatus, status: data.cloudinary.uploadStatus },
        {
          label: 'Connection Status',
          value: data.cloudinary.connectionStatus,
          status: data.cloudinary.connectionStatus,
        },
      ],
      futureFeatures: ['Replace Credentials'],
    },
    {
      id: 'payment',
      title: 'Payment',
      description: 'Gateway selection and payment infrastructure status.',
      fields: [
        { label: 'Current Gateway', value: capitalize(data.payment.currentGateway) },
        {
          label: 'Mock',
          value: data.payment.mockEnabled ? 'Active' : 'Inactive',
          status: data.payment.mockEnabled ? 'operational' : 'not_applicable',
        },
        {
          label: 'Future Razorpay',
          value: data.payment.razorpayReady ? 'Ready to enable' : 'Not configured',
          status: data.payment.razorpayReady ? 'operational' : 'not_configured',
        },
        {
          label: 'Connection Status',
          value: data.payment.connectionStatus,
          status: data.payment.connectionStatus,
        },
        {
          label: 'Webhook Status',
          value: data.payment.webhookStatus,
          status: data.payment.webhookStatus,
        },
      ],
    },
    {
      id: 'email',
      title: 'Email',
      description: 'Transactional email delivery configuration.',
      fields: [
        { label: 'SMTP Status', value: data.email.smtpStatus, status: data.email.smtpStatus },
        { label: 'Email Queue Status', value: data.email.queueStatus },
      ],
      futureFeatures: ['Configuration'],
    },
    {
      id: 'security',
      title: 'Security',
      description: 'Administrator access and session controls.',
      fields: [
        { label: 'Current Admin', value: data.security.currentAdmin },
        {
          label: 'Last Login',
          value: formatLastLogin(data.security.lastLogin),
        },
        {
          label: 'Password Change',
          value: 'Coming soon',
          placeholder: true,
        },
        {
          label: 'Session Timeout',
          value: `${data.security.sessionTimeoutHours} hours`,
        },
      ],
    },
    {
      id: 'maintenance',
      title: 'Maintenance',
      description: 'Operational controls for platform availability.',
      fields: [
        {
          label: 'Maintenance Mode',
          value: data.maintenance.maintenanceMode ? 'Enabled' : 'Disabled',
          placeholder: true,
        },
        {
          label: 'Read Only Mode',
          value: data.maintenance.readOnlyMode ? 'Enabled' : 'Disabled',
          placeholder: true,
        },
      ],
      futureFeatures: ['Scheduled maintenance windows', 'Read-only checkout lock'],
    },
    {
      id: 'about',
      title: 'About',
      description: 'Deployment metadata for this Chronivs instance.',
      fields: [
        { label: 'Chronivs Version', value: data.about.chronivsVersion },
        { label: 'Build Version', value: data.about.buildVersion },
        { label: 'Deployment Environment', value: capitalize(data.about.deploymentEnvironment) },
      ],
    },
  ];
}

export function buildBackupCard(data: AdminSettingsData): ConfigurationCardData {
  return {
    id: 'backup',
    title: 'Backup',
    description: 'Database export and backup tooling.',
    fields: [],
    futureFeatures: data.backup.futureFeatures,
  };
}
