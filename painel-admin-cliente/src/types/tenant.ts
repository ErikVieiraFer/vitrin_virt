import type { VitrineSection } from './section';

export type ButtonStyle = 'rounded' | 'pill' | 'square';

export interface ThemeSettings {
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  logoUrl?: string;
  backgroundColor?: string;
  buttonStyle?: ButtonStyle;
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
  sections: VitrineSection[];
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
  sections?: VitrineSection[];
}
