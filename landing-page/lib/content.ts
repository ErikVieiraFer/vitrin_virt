import { Feature, Step, Benefit, Testimonial, PricingPlan, FAQ } from '@/types/landing';

export const hero = {
  badge: '🚀 Lançamento 2025',
  title: 'Transforme seu negócio em uma vitrine virtual profissional',
  subtitle:
    'Plataforma completa de agendamentos personalizada para sua marca. Configure em minutos, agende em segundos.',
  ctaPrimary: 'Começar Grátis',
  ctaSecondary: 'Ver Demo',
  socialProof: '✨ Mais de 100+ negócios confiam em nós',
};

export const features: Feature[] = [
  {
    icon: 'Calendar',
    title: 'Agendamento Inteligente',
    description: 'Sistema de horários com disponibilidade em tempo real e confirmações automáticas',
  },
  {
    icon: 'Palette',
    title: '100% Personalizável',
    description: 'Cores, logo e fonte da sua marca. Crie uma experiência única para seus clientes',
  },
  {
    icon: 'Smartphone',
    title: 'Multiplataforma',
    description: 'Web e mobile com um único código. Seus clientes agendam de qualquer dispositivo',
  },
  {
    icon: 'MessageCircle',
    title: 'Integração WhatsApp',
    description: 'Confirmações e lembretes automáticos via WhatsApp para reduzir não-comparecimentos',
  },
  {
    icon: 'BarChart3',
    title: 'Dashboard Completo',
    description: 'Gerencie agendamentos, clientes e relatórios em um painel intuitivo',
  },
  {
    icon: 'Zap',
    title: 'Super Rápido',
    description: 'Configure sua vitrine virtual em menos de 5 minutos e comece a receber agendamentos',
  },
];

export const steps: Step[] = [
  {
    number: 1,
    icon: 'UserPlus',
    title: 'Cadastre-se',
    description: 'Crie sua conta gratuitamente em segundos. Sem cartão de crédito necessário.',
  },
  {
    number: 2,
    icon: 'Settings',
    title: 'Configure',
    description: 'Adicione seus serviços, defina horários e personalize com as cores da sua marca.',
  },
  {
    number: 3,
    icon: 'Share2',
    title: 'Compartilhe',
    description: 'Compartilhe seu link personalizado e comece a receber agendamentos imediatamente.',
  },
];

export const benefits: Benefit[] = [
  {
    title: 'Aumente suas conversões',
    description:
      'Transforme visitantes em clientes com uma experiência de agendamento profissional e sem atritos.',
    items: [
      'Link profissional personalizado com sua marca',
      'Disponibilidade em tempo real evita conflitos',
      'Processo de agendamento simplificado em 3 cliques',
      'Integração com calendário e lembretes automáticos',
    ],
    image: '/images/benefit-1.png',
    reverse: false,
  },
  {
    title: 'Economize tempo valioso',
    description:
      'Automatize todo o processo de agendamento e foque no que realmente importa: atender seus clientes.',
    items: [
      'Elimine ligações e mensagens para agendar',
      'Confirmações e lembretes automáticos via WhatsApp',
      'Gestão centralizada de todos os agendamentos',
      'Relatórios e analytics para otimizar seu negócio',
    ],
    image: '/images/benefit-2.png',
    reverse: true,
  },
  {
    title: 'Destaque-se da concorrência',
    description:
      'Ofereça uma experiência premium que seus concorrentes não têm e conquiste mais clientes.',
    items: [
      'Visual profissional que transmite confiança',
      'Sua marca em destaque em todos os pontos de contato',
      'Experiência mobile-first para clientes modernos',
      'Diferenciais que justificam preços premium',
    ],
    image: '/images/benefit-3.png',
    reverse: false,
  },
];

export const testimonials: Testimonial[] = [
  {
    id: 1,
    name: 'João Silva',
    role: 'Proprietário',
    company: 'Barbearia Top',
    content:
      'Aumentei meus agendamentos em 300% no primeiro mês! A plataforma é incrivelmente fácil de usar e meus clientes adoram.',
    image: '/images/testimonials/avatar-1.jpg',
    rating: 5,
  },
  {
    id: 2,
    name: 'Maria Santos',
    role: 'Esteticista',
    company: 'Clínica Beleza & Bem-Estar',
    content:
      'Antes eu perdia horas organizando agendamentos. Agora tudo é automático e profissional. Melhor investimento que fiz!',
    image: '/images/testimonials/avatar-2.jpg',
    rating: 5,
  },
  {
    id: 3,
    name: 'Pedro Costa',
    role: 'Personal Trainer',
    company: 'Fitness Pro',
    content:
      'Meus alunos conseguem agendar treinos a qualquer hora. Reduzi faltas em 80% com os lembretes automáticos.',
    image: '/images/testimonials/avatar-3.jpg',
    rating: 5,
  },
  {
    id: 4,
    name: 'Ana Oliveira',
    role: 'Dentista',
    company: 'Odonto Sorriso',
    content:
      'Interface linda e profissional! Meus pacientes elogiam a facilidade de agendar consultas. Recomendo muito!',
    image: '/images/testimonials/avatar-4.jpg',
    rating: 5,
  },
  {
    id: 5,
    name: 'Carlos Ferreira',
    role: 'Fotógrafo',
    company: 'CF Fotografia',
    content:
      'A personalização é fantástica! Consegui deixar tudo com a cara da minha marca. Clientes impressionados.',
    image: '/images/testimonials/avatar-5.jpg',
    rating: 5,
  },
  {
    id: 6,
    name: 'Juliana Rocha',
    role: 'Manicure',
    company: 'Studio Unhas Perfeitas',
    content:
      'Simples, rápido e eficiente. Configure em minutos e já estava recebendo agendamentos. Perfeito para pequenos negócios!',
    image: '/images/testimonials/avatar-6.jpg',
    rating: 5,
  },
];

export const pricingPlans: PricingPlan[] = [
  {
    name: 'Basic',
    price: 0,
    priceYearly: 0,
    description: 'Perfeito para começar',
    features: [
      'Até 3 serviços',
      '50 agendamentos/mês',
      'Tema básico',
      'Suporte por email',
      'Integração WhatsApp',
    ],
    cta: 'Começar Grátis',
  },
  {
    name: 'Pro',
    price: 49,
    priceYearly: 470,
    description: 'Para negócios em crescimento',
    features: [
      'Serviços ilimitados',
      'Agendamentos ilimitados',
      'Temas personalizados',
      'Suporte prioritário',
      'Integração WhatsApp',
      'Analytics avançado',
      'Sem marca Vitrine Virtual',
    ],
    highlighted: true,
    cta: 'Assinar Pro',
  },
  {
    name: 'Enterprise',
    price: 0,
    priceYearly: 0,
    description: 'Solução personalizada',
    features: [
      'Tudo do Pro +',
      'White label completo',
      'Integração API',
      'Suporte dedicado',
      'Onboarding personalizado',
      'SLA garantido',
    ],
    cta: 'Falar com Vendas',
  },
];

export const faqs: FAQ[] = [
  {
    question: 'Como funciona o período gratuito?',
    answer:
      'O plano Basic é 100% gratuito para sempre! Você pode começar agora sem precisar de cartão de crédito e fazer upgrade quando seu negócio crescer.',
  },
  {
    question: 'Posso cancelar a qualquer momento?',
    answer:
      'Sim! Não há contratos de longo prazo. Você pode cancelar sua assinatura a qualquer momento diretamente no painel, sem burocracias.',
  },
  {
    question: 'Preciso de conhecimento técnico para usar?',
    answer:
      'Não! A plataforma foi desenvolvida para ser extremamente intuitiva. Se você sabe usar o WhatsApp, vai conseguir configurar sua vitrine virtual em minutos.',
  },
  {
    question: 'Funciona no celular?',
    answer:
      'Perfeitamente! Tanto você quanto seus clientes podem acessar de qualquer dispositivo - celular, tablet ou computador. O design é totalmente responsivo.',
  },
  {
    question: 'Como personalizo as cores da minha marca?',
    answer:
      'No painel administrativo, você tem acesso completo para customizar cores, logo, fontes e muito mais. É simples como usar um editor de fotos.',
  },
  {
    question: 'Tem limite de agendamentos?',
    answer:
      'O plano Basic tem limite de 50 agendamentos por mês. Os planos Pro e Enterprise têm agendamentos ilimitados para você crescer sem preocupações.',
  },
  {
    question: 'Como recebo notificações dos agendamentos?',
    answer:
      'Você recebe notificações em tempo real por email, WhatsApp e no próprio painel. Pode configurar lembretes automáticos para você e seus clientes.',
  },
  {
    question: 'Posso usar meu próprio domínio?',
    answer:
      'Sim! No plano Pro e Enterprise você pode usar seu próprio domínio personalizado (ex: agenda.seusite.com) para reforçar sua marca.',
  },
];

export const ctaFinal = {
  title: 'Pronto para começar?',
  subtitle: 'Junte-se a centenas de negócios que já usam Vitrine Virtual',
  cta: 'Começar Grátis Agora',
  disclaimer: 'Sem cartão de crédito. Cancele quando quiser.',
};

export const footer = {
  description: 'Plataforma profissional de agendamentos para transformar seu negócio.',
  social: [
    { name: 'Instagram', url: '#', icon: 'Instagram' },
    { name: 'Facebook', url: '#', icon: 'Facebook' },
    { name: 'Twitter', url: '#', icon: 'Twitter' },
    { name: 'LinkedIn', url: '#', icon: 'Linkedin' },
  ],
  links: {
    product: [
      { label: 'Features', href: '#features' },
      { label: 'Preços', href: '#pricing' },
      { label: 'Como Funciona', href: '#how-it-works' },
      { label: 'Roadmap', href: '#' },
    ],
    support: [
      { label: 'FAQ', href: '#faq' },
      { label: 'Contato', href: '/contact' },
      { label: 'Docs', href: '#' },
      { label: 'Status', href: '#' },
    ],
    legal: [
      { label: 'Termos de Uso', href: '#' },
      { label: 'Política de Privacidade', href: '#' },
      { label: 'Cookies', href: '#' },
    ],
  },
  copyright: '© 2025 Vitrine Virtual. Todos os direitos reservados.',
};
