// Modelo de seções customizáveis da vitrine (editor visual). Ver /SCHEMA.md (tenants.sections).
// Mantenha em sincronia com o Flutter (que renderiza estas seções na vitrine pública).

export type SectionType =
  | 'hero'
  | 'cover'
  | 'text'
  | 'gallery'
  | 'services'
  | 'testimonials'
  | 'social'
  | 'hours'
  | 'address';

export interface HeroSectionData {
  title: string;
  subtitle: string;
  imageUrl?: string;
  ctaText?: string;
}

export interface CoverSectionData {
  title: string;
  subtitle: string;
  imageUrl?: string;
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

export interface TestimonialItem {
  name: string;
  text: string;
  rating: number;
}

export interface TestimonialsSectionData {
  items: TestimonialItem[];
}

export interface SocialSectionData {
  whatsapp?: string;
  instagram?: string;
  facebook?: string;
  tiktok?: string;
}

export interface HoursItem {
  label: string;
  value: string;
}

export interface HoursSectionData {
  items: HoursItem[];
}

export interface AddressSectionData {
  address: string;
  mapUrl?: string;
}

interface SectionBase {
  id: string;
  order: number;
}

export interface HeroSection extends SectionBase {
  type: 'hero';
  data: HeroSectionData;
}
export interface CoverSection extends SectionBase {
  type: 'cover';
  data: CoverSectionData;
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
export interface TestimonialsSection extends SectionBase {
  type: 'testimonials';
  data: TestimonialsSectionData;
}
export interface SocialSection extends SectionBase {
  type: 'social';
  data: SocialSectionData;
}
export interface HoursSection extends SectionBase {
  type: 'hours';
  data: HoursSectionData;
}
export interface AddressSection extends SectionBase {
  type: 'address';
  data: AddressSectionData;
}

export type VitrineSection =
  | HeroSection
  | CoverSection
  | TextSection
  | GallerySection
  | ServicesSection
  | TestimonialsSection
  | SocialSection
  | HoursSection
  | AddressSection;

export const SECTION_LABELS: Record<SectionType, string> = {
  hero: 'Banner principal',
  cover: 'Capa com foto',
  text: 'Texto livre',
  gallery: 'Galeria de fotos',
  services: 'Lista de serviços',
  testimonials: 'Depoimentos',
  social: 'Redes sociais',
  hours: 'Horário de funcionamento',
  address: 'Endereço / Localização',
};

let counter = 0;

/** Cria uma seção nova com valores padrão. */
export function createSection(type: SectionType, order: number): VitrineSection {
  const id = `${type}-${Date.now()}-${counter++}`;
  switch (type) {
    case 'hero':
      return { id, type, order, data: { title: '', subtitle: '', ctaText: 'Agendar' } };
    case 'cover':
      return { id, type, order, data: { title: '', subtitle: '' } };
    case 'text':
      return { id, type, order, data: { heading: '', body: '' } };
    case 'gallery':
      return { id, type, order, data: { images: [] } };
    case 'services':
      return { id, type, order, data: { showPrices: true, cardStyle: 'classic' } };
    case 'testimonials':
      return { id, type, order, data: { items: [] } };
    case 'social':
      return { id, type, order, data: {} };
    case 'hours':
      return {
        id,
        type,
        order,
        data: {
          items: [
            { label: 'Segunda a Sexta', value: '09:00 - 19:00' },
            { label: 'Sábado', value: '09:00 - 14:00' },
          ],
        },
      };
    case 'address':
      return { id, type, order, data: { address: '' } };
  }
}
