export interface ThemeSettings {
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  logoUrl?: string;
}

export interface Tenant {
  id: string;
  name: string;
  subdomain: string;
  ownerUid: string;
  whatsapp?: string;
  createdAt: Date;
  updatedAt: Date;
  themeSettings: ThemeSettings;
  active: boolean;
}

export interface CreateTenantData {
  name: string;
  subdomain: string;
  ownerUid: string;
  whatsapp?: string;
  themeSettings?: ThemeSettings;
}

export interface UpdateTenantData {
  name?: string;
  whatsapp?: string;
  themeSettings?: ThemeSettings;
}
