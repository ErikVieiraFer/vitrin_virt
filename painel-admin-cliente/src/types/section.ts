// Modelo de seções customizáveis da vitrine (editor visual). Ver /SCHEMA.md (tenants.sections).
// Mantenha em sincronia com o Flutter (que renderiza estas seções na vitrine pública).

export type SectionType = 'hero' | 'text' | 'gallery' | 'services';

export interface HeroSectionData {
  title: string;
  subtitle: string;
  imageUrl?: string;
  ctaText?: string;
}

export interface TextSectionData {
  heading: string;
  body: string;
}

export interface GallerySectionData {
  images: string[];
}

/** Estilo visual dos cards de serviço (com animação no toque/hover). */
export type ServiceCardStyle = 'classic' | 'overlay' | 'list';

export const SERVICE_CARD_STYLE_LABELS: Record<ServiceCardStyle, string> = {
  classic: 'Clássico (foto em cima)',
  overlay: 'Foto em destaque (texto sobre a imagem)',
  list: 'Lista compacta (foto ao lado)',
};

export interface ServicesSectionData {
  showPrices: boolean;
  cardStyle: ServiceCardStyle;
}

interface SectionBase {
  id: string;
  order: number;
}

export interface HeroSection extends SectionBase {
  type: 'hero';
  data: HeroSectionData;
}
export interface TextSection extends SectionBase {
  type: 'text';
  data: TextSectionData;
}
export interface GallerySection extends SectionBase {
  type: 'gallery';
  data: GallerySectionData;
}
export interface ServicesSection extends SectionBase {
  type: 'services';
  data: ServicesSectionData;
}

export type VitrineSection =
  | HeroSection
  | TextSection
  | GallerySection
  | ServicesSection;

export const SECTION_LABELS: Record<SectionType, string> = {
  hero: 'Banner principal',
  text: 'Texto livre',
  gallery: 'Galeria de fotos',
  services: 'Lista de serviços',
};

let counter = 0;

/** Cria uma seção nova com valores padrão. */
export function createSection(type: SectionType, order: number): VitrineSection {
  const id = `${type}-${Date.now()}-${counter++}`;
  switch (type) {
    case 'hero':
      return { id, type, order, data: { title: '', subtitle: '', ctaText: 'Agendar' } };
    case 'text':
      return { id, type, order, data: { heading: '', body: '' } };
    case 'gallery':
      return { id, type, order, data: { images: [] } };
    case 'services':
      return { id, type, order, data: { showPrices: true, cardStyle: 'classic' } };
  }
}
