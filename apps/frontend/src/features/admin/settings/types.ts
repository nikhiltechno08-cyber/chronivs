export type AdminSettingsGeneral = {
  platformName: string;
  platformVersion: string;
  environment: string;
};

export type AdminSettingsCloudinary = {
  cloudName: string | null;
  uploadStatus: string;
  connectionStatus: string;
};

export type AdminSettingsPayment = {
  currentGateway: string;
  mockEnabled: boolean;
  razorpayReady: boolean;
  connectionStatus: string;
  webhookStatus: string;
};

export type AdminSettingsEmail = {
  smtpStatus: string;
  queueStatus: string;
};

export type AdminSettingsSecurity = {
  currentAdmin: string;
  lastLogin: string | null;
  sessionTimeoutHours: number;
};

export type AdminSettingsMaintenance = {
  maintenanceMode: boolean;
  readOnlyMode: boolean;
};

export type AdminSettingsBackup = {
  futureFeatures: string[];
};

export type AdminSettingsAbout = {
  chronivsVersion: string;
  buildVersion: string;
  deploymentEnvironment: string;
};

export type AdminSettingsHealthItem = {
  label: string;
  status: string;
};

export type AdminSettingsData = {
  general: AdminSettingsGeneral;
  cloudinary: AdminSettingsCloudinary;
  payment: AdminSettingsPayment;
  email: AdminSettingsEmail;
  security: AdminSettingsSecurity;
  maintenance: AdminSettingsMaintenance;
  systemHealth: AdminSettingsHealthItem[];
  backup: AdminSettingsBackup;
  about: AdminSettingsAbout;
};

export type SettingsField = {
  label: string;
  value: string;
  status?: string | null;
  placeholder?: boolean;
};

export type ConfigurationCardData = {
  id: string;
  title: string;
  description?: string;
  fields: SettingsField[];
  futureFeatures?: string[];
};
