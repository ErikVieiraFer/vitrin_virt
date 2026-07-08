import type { VitrineSection } from '@/types/section';

// Templates prontos por nicho — populam o editor com um conjunto de seções
// já organizado, pra o dono começar de um ponto bonito em vez de tela em branco.

let tplCounter = 0;
function sid(type: string): string {
  return `${type}-tpl-${Date.now()}-${tplCounter++}`;
}

export interface NicheTemplate {
  key: string;
  label: string;
  build: () => VitrineSection[];
}

export const NICHE_TEMPLATES: NicheTemplate[] = [
  {
    key: 'barbearia',
    label: 'Barbearia',
    build: (): VitrineSection[] => [
      {
        id: sid('cover'),
        type: 'cover',
        order: 0,
        data: { title: 'Sua Barbearia', subtitle: 'Estilo e precisão no seu corte' },
      },
      { id: sid('services'), type: 'services', order: 1, data: { showPrices: true, cardStyle: 'overlay' } },
      {
        id: sid('hours'),
        type: 'hours',
        order: 2,
        data: {
          items: [
            { label: 'Segunda a Sexta', value: '09:00 - 20:00' },
            { label: 'Sábado', value: '09:00 - 18:00' },
          ],
        },
      },
      {
        id: sid('testimonials'),
        type: 'testimonials',
        order: 3,
        data: { items: [{ name: 'Cliente', text: 'Melhor corte da cidade!', rating: 5 }] },
      },
      { id: sid('social'), type: 'social', order: 4, data: {} },
      { id: sid('address'), type: 'address', order: 5, data: { address: '' } },
    ],
  },
  {
    key: 'salao',
    label: 'Salão de beleza',
    build: (): VitrineSection[] => [
      {
        id: sid('cover'),
        type: 'cover',
        order: 0,
        data: { title: 'Seu Salão', subtitle: 'Beleza e cuidado pra você' },
      },
      { id: sid('services'), type: 'services', order: 1, data: { showPrices: true, cardStyle: 'classic' } },
      { id: sid('gallery'), type: 'gallery', order: 2, data: { images: [] } },
      {
        id: sid('hours'),
        type: 'hours',
        order: 3,
        data: {
          items: [
            { label: 'Terça a Sábado', value: '09:00 - 19:00' },
          ],
        },
      },
      { id: sid('social'), type: 'social', order: 4, data: {} },
      { id: sid('address'), type: 'address', order: 5, data: { address: '' } },
    ],
  },
  {
    key: 'tattoo',
    label: 'Estúdio de tattoo',
    build: (): VitrineSection[] => [
      {
        id: sid('cover'),
        type: 'cover',
        order: 0,
        data: { title: 'Seu Estúdio', subtitle: 'Arte na pele' },
      },
      { id: sid('gallery'), type: 'gallery', order: 1, data: { images: [] } },
      { id: sid('services'), type: 'services', order: 2, data: { showPrices: false, cardStyle: 'overlay' } },
      {
        id: sid('testimonials'),
        type: 'testimonials',
        order: 3,
        data: { items: [{ name: 'Cliente', text: 'Trabalho impecável!', rating: 5 }] },
      },
      { id: sid('social'), type: 'social', order: 4, data: {} },
    ],
  },
  {
    key: 'clinica',
    label: 'Clínica',
    build: (): VitrineSection[] => [
      {
        id: sid('cover'),
        type: 'cover',
        order: 0,
        data: { title: 'Sua Clínica', subtitle: 'Atendimento de confiança' },
      },
      { id: sid('services'), type: 'services', order: 1, data: { showPrices: true, cardStyle: 'list' } },
      {
        id: sid('hours'),
        type: 'hours',
        order: 2,
        data: {
          items: [
            { label: 'Segunda a Sexta', value: '08:00 - 18:00' },
          ],
        },
      },
      { id: sid('address'), type: 'address', order: 3, data: { address: '' } },
      { id: sid('social'), type: 'social', order: 4, data: {} },
    ],
  },
];
