import {
  Feature,
  Step,
  Benefit,
  Testimonial,
  PricingPlan,
  FAQ,
  Metric,
  Integration,
} from '@/types/landing';

export const hero = {
  badge: 'Sem cartão de crédito • Pronto em 5 minutos',
  title: 'Agenda cheia, sem responder WhatsApp o dia todo',
  subtitle:
    'Seus clientes agendam sozinhos pelo seu link personalizado, 24 horas por dia. Você recebe tudo organizado e manda lembrete automático pra ninguém furar horário.',
  ctaPrimary: 'Criar minha vitrine grátis',
  ctaSecondary: 'Ver demonstração',
  proofs: ['Pronto em 5 minutos', 'Sem cartão de crédito', 'Cancele quando quiser'],
};

export const niches: string[] = [
  'Barbearias',
  'Salões de beleza',
  'Estúdios de tattoo',
  'Clínicas',
  'Manicures & nail designers',
  'Esteticistas',
  'Personal trainers',
  'Fotógrafos',
];

export const metrics: Metric[] = [
  { value: '−80%', label: 'menos faltas com lembretes automáticos' },
  { value: '24h', label: 'recebendo agendamentos, sem você responder' },
  { value: '5 min', label: 'pra configurar e publicar seu link' },
  { value: '+100', label: 'negócios já confiam na Vitrine Virtual' },
];

export const features: Feature[] = [
  {
    icon: 'Calendar',
    title: 'Sua agenda no piloto automático',
    description:
      'Os clientes veem só os horários livres e agendam em 3 toques. Acabaram os conflitos e o vai-e-volta de mensagem.',
  },
  {
    icon: 'MessageCircle',
    title: 'Lembretes que evitam o furo',
    description:
      'Confirmação na hora e lembrete automático no WhatsApp antes do horário. Menos faltas, mais faturamento.',
  },
  {
    icon: 'Palette',
    title: 'Com a cara da sua marca',
    description:
      'Suas cores, sua logo e suas fotos. Uma vitrine que transmite o profissionalismo do seu negócio.',
  },
  {
    icon: 'Smartphone',
    title: 'Funciona em qualquer celular',
    description:
      'Seus clientes agendam do celular, sem instalar nada. Você gerencia de onde estiver.',
  },
  {
    icon: 'BarChart3',
    title: 'Você no controle',
    description:
      'Veja agendamentos do dia, confirme, cancele e acompanhe seu movimento num painel simples.',
  },
  {
    icon: 'Zap',
    title: 'No ar em minutos',
    description:
      'Crie a conta, adicione seus serviços e compartilhe o link. Em 5 minutos você já recebe agendamento.',
  },
];

export const steps: Step[] = [
  {
    number: 1,
    icon: 'UserPlus',
    title: 'Crie sua conta',
    description: 'De graça, em segundos. Sem cartão de crédito, sem burocracia.',
  },
  {
    number: 2,
    icon: 'Settings',
    title: 'Monte sua vitrine',
    description: 'Adicione serviços, defina seus horários e deixe com a cara da sua marca.',
  },
  {
    number: 3,
    icon: 'Share2',
    title: 'Compartilhe o link',
    description: 'Coloque na bio do Instagram e no status do WhatsApp. Pronto: a agenda começa a encher.',
  },
];

export const integrations: Integration[] = [
  {
    icon: 'MessageCircle',
    name: 'WhatsApp',
    description: 'Confirmações e lembretes automáticos pra reduzir faltas.',
  },
  {
    icon: 'CalendarCheck',
    name: 'Google Agenda',
    description: 'Seus compromissos sincronizados, sem digitar duas vezes.',
  },
  {
    icon: 'QrCode',
    name: 'Link & QR Code',
    description: 'Um link na bio e um QR Code na recepção. Agendar fica fácil.',
  },
  {
    icon: 'Banknote',
    name: 'Pagamentos (em breve)',
    description: 'Cobre um sinal no agendamento e reduza o no-show de vez.',
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
      'Lembretes automáticos no WhatsApp',
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
      'Relatórios para otimizar seu negócio',
    ],
    image: '/images/benefit-2.png',
    reverse: true,
  },
];

export const testimonials: Testimonial[] = [
  {
    id: 1,
    name: 'João Silva',
    role: 'Proprietário',
    company: 'Barbearia Top',
    content:
      'Parei de perder horário trocando mensagem. O cliente agenda sozinho e ainda recebe o lembrete. Minha agenda nunca esteve tão cheia.',
    image: '/images/testimonials/avatar-1.jpg',
    rating: 5,
  },
  {
    id: 2,
    name: 'Maria Santos',
    role: 'Esteticista',
    company: 'Clínica Beleza & Bem-Estar',
    content:
      'Antes eu perdia horas organizando agendamento. Agora é tudo automático e profissional. Melhor decisão que tomei pro meu negócio.',
    image: '/images/testimonials/avatar-2.jpg',
    rating: 5,
  },
  {
    id: 3,
    name: 'Juliana Rocha',
    role: 'Nail Designer',
    company: 'Studio Unhas Perfeitas',
    content:
      'Simples e rápido. Configurei em minutos e no mesmo dia já estava recebendo agendamento pela bio do Instagram.',
    image: '/images/testimonials/avatar-3.jpg',
    rating: 5,
  },
  {
    id: 4,
    name: 'Carlos Mendes',
    role: 'Barbeiro',
    company: 'Don Carlos Barbearia',
    content:
      'O lembrete automático no WhatsApp acabou com os furos. Antes eu tinha umas 5 faltas por semana, hoje é raríssimo alguém não aparecer.',
    image: '/images/testimonials/avatar-4.jpg',
    rating: 5,
  },
  {
    id: 5,
    name: 'Patrícia Lima',
    role: 'Cabeleireira',
    company: 'Salão Glamour',
    content:
      'Meus clientes adoraram poder agendar a qualquer hora, até de madrugada. Pra mim sobrou tempo pra focar no atendimento.',
    image: '/images/testimonials/avatar-5.jpg',
    rating: 5,
  },
  {
    id: 6,
    name: 'Rafael Oliveira',
    role: 'Tatuador',
    company: 'Black Ink Studio',
    content:
      'A vitrine ficou com a cara do meu estúdio. Passou muito mais profissionalismo e fechei mais sessões só com o link na bio.',
    image: '/images/testimonials/avatar-6.jpg',
    rating: 5,
  },
  {
    id: 7,
    name: 'Fernanda Costa',
    role: 'Manicure',
    company: 'Espaço Fer Nails',
    content:
      'Eu não entendo nada de tecnologia e mesmo assim coloquei tudo no ar sozinha. É muito fácil de usar.',
    image: '/images/testimonials/avatar-7.jpg',
    rating: 5,
  },
  {
    id: 8,
    name: 'Bruno Almeida',
    role: 'Personal Trainer',
    company: 'BA Performance',
    content:
      'Organizei todos os meus horários de treino num só lugar. Os alunos agendam sozinhos e eu acompanho tudo pelo celular.',
    image: '/images/testimonials/avatar-8.jpg',
    rating: 5,
  },
  {
    id: 9,
    name: 'Camila Souza',
    role: 'Designer de Sobrancelhas',
    company: 'Camila Brows',
    content:
      'Reduzi muito as faltas e ainda consegui encaixar mais clientes no dia. Em um mês já valeu o investimento.',
    image: '/images/testimonials/avatar-9.jpg',
    rating: 5,
  },
  {
    id: 10,
    name: 'Diego Ferreira',
    role: 'Fotógrafo',
    company: 'DF Estúdio',
    content:
      'Agendamento de ensaios virou outra coisa. O cliente escolhe o pacote e o horário, e eu só preciso confirmar. Profissional demais.',
    image: '/images/testimonials/avatar-10.jpg',
    rating: 5,
  },
  {
    id: 11,
    name: 'Aline Martins',
    role: 'Proprietária',
    company: 'Clínica Estética Renove',
    content:
      'Gerencio a agenda de 4 profissionais sem confusão nenhuma. O painel é claro e o suporte responde rápido quando preciso.',
    image: '/images/testimonials/avatar-11.jpg',
    rating: 5,
  },
  {
    id: 12,
    name: 'Thiago Nunes',
    role: 'Barbeiro',
    company: 'Studio TN',
    content:
      'O melhor é não precisar mais parar no meio de um corte pra responder WhatsApp. A agenda se organiza sozinha enquanto eu trabalho.',
    image: '/images/testimonials/avatar-12.jpg',
    rating: 5,
  },
];

export const pricingPlans: PricingPlan[] = [
  {
    name: 'Basic',
    price: 0,
    priceYearly: 0,
    description: 'Pra começar agora mesmo',
    features: [
      'Até 3 serviços',
      '20 agendamentos/mês',
      'Tema básico',
      'Suporte por email',
      'Integração WhatsApp',
    ],
    cta: 'Começar Grátis',
  },
  {
    name: 'Pro',
    price: 87.9,
    priceYearly: 879.9,
    priceOriginal: 199.9,
    priceYearlyOriginal: 2000,
    description: 'Pra encher a agenda de vez',
    features: [
      'Serviços ilimitados',
      'Agendamentos ilimitados',
      'Temas personalizados',
      'Suporte prioritário',
      'Lembretes automáticos no WhatsApp',
      'Relatórios completos',
      'Sem marca Vitrine Virtual',
    ],
    highlighted: true,
    cta: 'Assinar Pro',
  },
  {
    name: 'Enterprise',
    price: 150,
    priceYearly: 1800,
    description: 'Personalizável para equipes e clínicas',
    features: [
      'Tudo do Pro +',
      'White label completo',
      'Pagamento integrado',
      'Suporte dedicado',
      'Configuração feita por nós',
      'Garantia de funcionamento 24h',
    ],
    additionalInfo: 'Plano sob medida: o valor varia conforme o tamanho da sua equipe e os recursos que você precisa.',
    cta: 'Falar com Vendas',
  },
];

export const faqs: FAQ[] = [
  {
    question: 'Quanto tempo leva pra colocar no ar?',
    answer:
      'Cerca de 5 minutos. Você cria a conta, adiciona seus serviços e horários, e já recebe um link pronto pra compartilhar. Sem instalação e sem conhecimento técnico.',
  },
  {
    question: 'É de graça mesmo?',
    answer:
      'Sim! O plano Basic é gratuito pra sempre, sem cartão de crédito. Você só faz upgrade pro Pro quando seu negócio crescer e quiser agendamentos ilimitados.',
  },
  {
    question: 'Preciso de conhecimento técnico?',
    answer:
      'Não. Se você sabe usar o WhatsApp, sabe usar a Vitrine Virtual. Tudo é feito por um painel simples, sem código.',
  },
  {
    question: 'Funciona pra equipe com vários profissionais?',
    answer:
      'Sim. Nos planos pagos você adiciona profissionais com agenda própria — ideal pra barbearias e salões com vários atendentes.',
  },
  {
    question: 'Como os lembretes reduzem as faltas?',
    answer:
      'O cliente recebe confirmação na hora do agendamento e um lembrete automático antes do horário. Isso reduz drasticamente os esquecimentos e o no-show.',
  },
  {
    question: 'Meus clientes precisam baixar algum app?',
    answer:
      'Não. Eles agendam direto pelo link, no navegador do celular. É só tocar, escolher o serviço e o horário.',
  },
  {
    question: 'Posso usar meu próprio domínio?',
    answer:
      'Sim! Nos planos Pro e Enterprise você pode usar um domínio personalizado (ex.: agenda.seunegocio.com.br) pra reforçar a sua marca.',
  },
  {
    question: 'Perco meus dados se cancelar?',
    answer:
      'Você pode cancelar quando quiser, sem multa. Antes disso, é possível exportar seus agendamentos e contatos.',
  },
];

export const ctaFinal = {
  title: 'Pronto pra encher sua agenda?',
  subtitle: 'Junte-se a centenas de negócios que já agendam no automático com a Vitrine Virtual.',
  cta: 'Criar minha vitrine grátis',
  disclaimer: 'Sem cartão de crédito. Cancele quando quiser.',
};

export const footer = {
  description: 'A agenda online que enche o seu negócio — barbearias, salões, estúdios e clínicas.',
  social: [
    { name: 'Instagram', url: 'https://www.instagram.com/vitrinevirtofc', icon: 'Instagram' },
    { name: 'WhatsApp', url: 'https://wa.me/5527998547188', icon: 'MessageCircle' },
  ],
  links: {
    product: [
      { label: 'Recursos', href: '#features' },
      { label: 'Como funciona', href: '#how-it-works' },
      { label: 'Preços', href: '#pricing' },
      { label: 'Perguntas frequentes', href: '#faq' },
    ],
    support: [
      { label: 'Falar no WhatsApp', href: 'https://wa.me/5527998547188' },
      { label: 'Entrar no painel', href: 'https://painel.vitrinevirt.com/login' },
      { label: 'Ver demonstração', href: 'https://demo.vitrinevirt.com/#/home' },
    ],
  },
  copyright: '© 2025 Vitrine Virtual. Todos os direitos reservados.',
};
