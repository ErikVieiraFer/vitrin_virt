'use client';

import { useCallback, useEffect, useState } from 'react';
import { fn } from '@/lib/firebase';

interface Dados {
  negocio: { nome: string; slug: string; whatsapp: string };
  agendamento: {
    inicioIso: string;
    status: string;
    clienteNome: string;
    profissional: string;
    servico: string;
    profId: string;
    servicoId: string;
    antecedenciaMinCancelamentoMin: number;
  };
}

export function GestaoAgendamento({ token }: { token: string }) {
  const [dados, setDados] = useState<Dados | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [agindo, setAgindo] = useState(false);
  const [reagendando, setReagendando] = useState(false);
  const [dia, setDia] = useState<Date>(new Date());
  const [slots, setSlots] = useState<string[]>([]);
  const [buscandoSlots, setBuscandoSlots] = useState(false);
  const [tenantIdCache, setTenantIdCache] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    setCarregando(true);
    try {
      const resp = await fn.obterAgendamentoPorToken({ token });
      setDados(resp.data as Dados);
    } catch {
      setErro('Agendamento não encontrado.');
    } finally {
      setCarregando(false);
    }
  }, [token]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  // Para reagendar precisamos do tenantId — buscamos via slug público.
  useEffect(() => {
    (async () => {
      if (!dados || tenantIdCache) return;
      const { getDoc, doc } = await import('firebase/firestore');
      const { db } = await import('@/lib/firebase');
      const slugSnap = await getDoc(doc(db, 'slugs', dados.negocio.slug));
      if (slugSnap.exists()) {
        setTenantIdCache(slugSnap.data().tenantId as string);
      }
    })();
  }, [dados, tenantIdCache]);

  const buscarSlots = useCallback(
    async (d: Date) => {
      if (!dados || !tenantIdCache) return;
      setBuscandoSlots(true);
      setSlots([]);
      try {
        const resp = await fn.listarSlots({
          tenantId: tenantIdCache,
          profId: dados.agendamento.profId,
          servicoId: dados.agendamento.servicoId,
          dataIso: d.toLocaleDateString('sv-SE'),
        });
        setSlots((resp.data as { slots: string[] }).slots);
      } finally {
        setBuscandoSlots(false);
      }
    },
    [dados, tenantIdCache],
  );

  async function cancelar() {
    if (!confirm('Tem certeza que deseja cancelar este agendamento?')) return;
    setAgindo(true);
    setErro(null);
    try {
      await fn.cancelarAgendamento({ token });
      await carregar();
    } catch (e) {
      setErro(extrairMensagem(e));
    } finally {
      setAgindo(false);
    }
  }

  async function reagendar(novoInicioIso: string) {
    setAgindo(true);
    setErro(null);
    try {
      const resp = await fn.reagendarAgendamento({ token, novoInicioIso });
      const novoToken = (resp.data as { token: string }).token;
      window.location.href = `/a/${novoToken}`;
    } catch (e) {
      setErro(extrairMensagem(e));
      setAgindo(false);
    }
  }

  if (carregando) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-800" />
      </main>
    );
  }

  if (!dados) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-2 p-8 text-center">
        <h1 className="text-2xl font-bold">Link inválido</h1>
        <p className="text-neutral-600">{erro ?? 'Agendamento não encontrado.'}</p>
      </main>
    );
  }

  const a = dados.agendamento;
  const quando = new Date(a.inicioIso);
  const ativo = a.status === 'agendado';
  const passado = quando.getTime() < Date.now();
  const statusLabel: Record<string, string> = {
    agendado: 'Confirmado',
    concluido: 'Concluído',
    cancelado_cliente: 'Cancelado',
    cancelado_dono: 'Cancelado pelo estabelecimento',
    no_show: 'Não compareceu',
  };

  const dias = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d;
  });

  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col gap-4 p-6">
      <h1 className="text-xl font-bold">Seu agendamento</h1>

      <div className="rounded-2xl border bg-white p-5 shadow-sm">
        <p className="text-sm text-neutral-500">{dados.negocio.nome}</p>
        <p className="mt-1 text-lg font-semibold">{a.servico}</p>
        <p className="text-neutral-600">com {a.profissional}</p>
        <p className="mt-2 font-medium capitalize">
          {quando.toLocaleString('pt-BR', {
            weekday: 'long',
            day: '2-digit',
            month: 'long',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
        <span
          className={`mt-3 inline-block rounded-full px-3 py-1 text-sm font-medium ${
            ativo
              ? 'bg-green-100 text-green-800'
              : 'bg-neutral-100 text-neutral-600'
          }`}
        >
          {statusLabel[a.status] ?? a.status}
        </span>
      </div>

      {erro && <p className="text-sm text-red-600">{erro}</p>}

      {ativo && !passado && !reagendando && (
        <div className="flex flex-col gap-2">
          <button
            onClick={() => {
              setReagendando(true);
              buscarSlots(dia);
            }}
            disabled={agindo}
            className="rounded-xl bg-neutral-900 py-3 font-semibold text-white disabled:opacity-40"
          >
            Remarcar horário
          </button>
          <button
            onClick={cancelar}
            disabled={agindo}
            className="rounded-xl border border-red-300 py-3 font-semibold text-red-600 disabled:opacity-40"
          >
            Cancelar agendamento
          </button>
          <p className="text-center text-xs text-neutral-400">
            Alterações são permitidas até{' '}
            {a.antecedenciaMinCancelamentoMin >= 60
              ? `${Math.round(a.antecedenciaMinCancelamentoMin / 60)}h`
              : `${a.antecedenciaMinCancelamentoMin}min`}{' '}
            antes do horário.
          </p>
        </div>
      )}

      {reagendando && (
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <p className="font-medium">Escolha o novo horário</p>
          <div className="mt-3 flex gap-2 overflow-x-auto pb-2">
            {dias.map((d) => {
              const sel = d.toDateString() === dia.toDateString();
              return (
                <button
                  key={d.toISOString()}
                  onClick={() => {
                    setDia(d);
                    buscarSlots(d);
                  }}
                  className={`flex min-w-14 flex-col items-center rounded-xl border px-3 py-2 text-sm ${
                    sel ? 'bg-neutral-900 text-white' : 'hover:bg-neutral-50'
                  }`}
                >
                  <span className="capitalize">
                    {d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '')}
                  </span>
                  <span className="text-lg font-semibold">{d.getDate()}</span>
                </button>
              );
            })}
          </div>
          <div className="mt-3 min-h-16">
            {buscandoSlots ? (
              <div className="flex justify-center py-4">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-800" />
              </div>
            ) : slots.length === 0 ? (
              <p className="py-4 text-center text-neutral-500">
                Nenhum horário livre neste dia
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {slots.map((s) => (
                  <button
                    key={s}
                    disabled={agindo}
                    onClick={() => reagendar(s)}
                    className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-neutral-50 disabled:opacity-40"
                  >
                    {new Date(s).toLocaleTimeString('pt-BR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={() => setReagendando(false)}
            className="mt-2 text-sm text-neutral-500 underline"
          >
            Voltar
          </button>
        </div>
      )}

      {dados.negocio.whatsapp && (
        <a
          href={`https://wa.me/${dados.negocio.whatsapp.replace(/\D/g, '')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-center text-sm underline"
        >
          Falar com {dados.negocio.nome} no WhatsApp
        </a>
      )}
    </main>
  );
}

function extrairMensagem(e: unknown): string {
  const msg = (e as { message?: string })?.message ?? 'Erro. Tente novamente.';
  return msg.replace(/^.*?:\s*/, '');
}
