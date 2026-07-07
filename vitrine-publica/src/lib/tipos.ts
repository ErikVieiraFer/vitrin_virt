export interface Personalizacao {
  logoUrl?: string | null;
  capaUrl?: string | null;
  fotos: string[];
  corPrimaria: string;
  corSecundaria: string;
  corFundo: string;
}

export interface Endereco {
  logradouro?: string;
  numero?: string;
  bairro?: string;
  cidade?: string;
  uf?: string;
}

export interface Negocio {
  id: string;
  nome: string;
  slug: string;
  descricao: string;
  categoria: string;
  telefoneWhatsapp: string;
  endereco: Endereco | null;
  redes: { instagram?: string; facebook?: string; site?: string };
  personalizacao: Personalizacao;
  ativo: boolean;
  janelaMaxAgendamentoDias: number;
}

export interface Servico {
  id: string;
  nome: string;
  descricao: string;
  duracaoMin: number;
  precoCentavos: number;
  fotoUrl?: string | null;
}

export interface Profissional {
  id: string;
  nome: string;
  fotoUrl?: string | null;
  servicoIds: string[];
}

export function formatarPreco(centavos: number): string {
  return (centavos / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}
