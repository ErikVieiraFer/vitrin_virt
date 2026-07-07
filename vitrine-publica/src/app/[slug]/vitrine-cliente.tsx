'use client';

import { useEffect, useState } from 'react';
import { buscarNegocioPorSlug, buscarProfissionais, buscarServicos } from '@/lib/negocio';
import type { Negocio, Profissional, Servico } from '@/lib/tipos';
import { formatarPreco } from '@/lib/tipos';
import { FluxoAgendamento } from '@/components/fluxo-agendamento';

export function VitrineCliente({ slug }: { slug: string }) {
  const [carregando, setCarregando] = useState(true);
  const [negocio, setNegocio] = useState<Negocio | null>(null);
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [profissionais, setProfissionais] = useState<Profissional[]>([]);
  const [servicoEscolhido, setServicoEscolhido] = useState<Servico | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const n = await buscarNegocioPorSlug(slug);
        setNegocio(n);
        if (n) {
          const [s, p] = await Promise.all([
            buscarServicos(n.id),
            buscarProfissionais(n.id),
          ]);
          setServicos(s);
          setProfissionais(p);
        }
      } finally {
        setCarregando(false);
      }
    })();
  }, [slug]);

  if (carregando) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-800" />
      </main>
    );
  }

  if (!negocio) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-2 p-8 text-center">
        <h1 className="text-2xl font-bold">Página não encontrada</h1>
        <p className="text-neutral-600">
          Confira o endereço com o seu prestador de serviço.
        </p>
      </main>
    );
  }

  if (!negocio.ativo) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-2 p-8 text-center">
        <h1 className="text-2xl font-bold">{negocio.nome}</h1>
        <p className="text-neutral-600">
          O agendamento online está temporariamente indisponível. Entre em
          contato diretamente com o estabelecimento.
        </p>
      </main>
    );
  }

  const pers = negocio.personalizacao;
  const endereco = negocio.endereco;

  return (
    <main
      className="min-h-screen"
      style={
        {
          '--cor-primaria': pers.corPrimaria,
          '--cor-secundaria': pers.corSecundaria,
        } as React.CSSProperties
      }
    >
      {/* Capa */}
      <div
        className="h-40 w-full bg-cover bg-center sm:h-56"
        style={{
          backgroundColor: 'var(--cor-secundaria)',
          backgroundImage: pers.capaUrl ? `url(${pers.capaUrl})` : undefined,
        }}
      />

      <div className="mx-auto max-w-2xl px-4 pb-24">
        {/* Cabeçalho */}
        <div className="-mt-10 flex items-end gap-4">
          {pers.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={pers.logoUrl}
              alt={negocio.nome}
              className="h-20 w-20 rounded-2xl border-4 border-white bg-white object-cover shadow"
            />
          ) : (
            <div
              className="flex h-20 w-20 items-center justify-center rounded-2xl border-4 border-white text-3xl font-bold text-white shadow"
              style={{ backgroundColor: 'var(--cor-primaria)' }}
            >
              {negocio.nome.charAt(0)}
            </div>
          )}
        </div>

        <h1 className="mt-3 text-2xl font-bold">{negocio.nome}</h1>
        {negocio.descricao && (
          <p className="mt-1 text-neutral-600">{negocio.descricao}</p>
        )}
        {endereco?.logradouro && (
          <p className="mt-1 text-sm text-neutral-500">
            📍 {endereco.logradouro}
            {endereco.numero ? `, ${endereco.numero}` : ''}
            {endereco.bairro ? ` — ${endereco.bairro}` : ''}
            {endereco.cidade ? `, ${endereco.cidade}` : ''}
            {endereco.uf ? `/${endereco.uf}` : ''}
          </p>
        )}
        {negocio.redes.instagram && (
          <a
            className="mt-1 inline-block text-sm underline"
            style={{ color: 'var(--cor-primaria)' }}
            href={`https://instagram.com/${negocio.redes.instagram}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            @{negocio.redes.instagram}
          </a>
        )}

        {/* Serviços */}
        <h2 className="mt-8 text-lg font-semibold">Escolha um serviço</h2>
        <div className="mt-3 flex flex-col gap-3">
          {servicos.length === 0 && (
            <p className="text-neutral-500">Nenhum serviço disponível.</p>
          )}
          {servicos.map((s) => (
            <button
              key={s.id}
              onClick={() => setServicoEscolhido(s)}
              className="flex items-center justify-between rounded-2xl border bg-white p-4 text-left shadow-sm transition hover:shadow"
            >
              <div>
                <p className="font-medium">{s.nome}</p>
                <p className="text-sm text-neutral-500">
                  {s.duracaoMin} min
                  {s.descricao ? ` · ${s.descricao}` : ''}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-semibold">
                  {formatarPreco(s.precoCentavos)}
                </span>
                <span
                  className="rounded-full px-4 py-2 text-sm font-medium text-white"
                  style={{ backgroundColor: 'var(--cor-primaria)' }}
                >
                  Agendar
                </span>
              </div>
            </button>
          ))}
        </div>

        <p className="mt-10 text-center text-xs text-neutral-400">
          Agendamento por <strong>Vitrine Virtual</strong>
        </p>
      </div>

      {servicoEscolhido && (
        <FluxoAgendamento
          negocio={negocio}
          servico={servicoEscolhido}
          profissionais={profissionais.filter((p) =>
            p.servicoIds.includes(servicoEscolhido.id),
          )}
          aoFechar={() => setServicoEscolhido(null)}
        />
      )}
    </main>
  );
}
