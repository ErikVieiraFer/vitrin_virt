'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { fn } from '@/lib/firebase';
import type { Negocio, Profissional, Servico } from '@/lib/tipos';
import { formatarPreco } from '@/lib/tipos';

type Etapa = 'profissional' | 'horario' | 'dados' | 'confirmado';

interface Props {
  negocio: Negocio;
  servico: Servico;
  profissionais: Profissional[];
  aoFechar: () => void;
}

function proximosDias(qtd: number): Date[] {
  const hoje = new Date();
  return Array.from({ length: qtd }, (_, i) => {
    const d = new Date(hoje);
    d.setDate(hoje.getDate() + i);
    return d;
  });
}

export function FluxoAgendamento({ negocio, servico, profissionais, aoFechar }: Props) {
  const [etapa, setEtapa] = useState<Etapa>(
    profissionais.length === 1 ? 'horario' : 'profissional',
  );
  const [prof, setProf] = useState<Profissional | null>(
    profissionais.length === 1 ? profissionais[0] : null,
  );
  const [dia, setDia] = useState<Date>(new Date());
  const [slots, setSlots] = useState<string[]>([]);
  const [buscandoSlots, setBuscandoSlots] = useState(false);
  const [slot, setSlot] = useState<string | null>(null);
  const [nome, setNome] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [tokenGestao, setTokenGestao] = useState<string | null>(null);

  const dias = useMemo(
    () => proximosDias(Math.min(negocio.janelaMaxAgendamentoDias, 30)),
    [negocio.janelaMaxAgendamentoDias],
  );

  const buscarSlots = useCallback(async () => {
    if (!prof) return;
    setBuscandoSlots(true);
    setSlots([]);
    setSlot(null);
    try {
      const dataIso = dia.toLocaleDateString('sv-SE'); // yyyy-MM-dd
      const resp = await fn.listarSlots({
        tenantId: negocio.id,
        profId: prof.id,
        servicoId: servico.id,
        dataIso,
      });
      setSlots((resp.data as { slots: string[] }).slots);
    } catch {
      setErro('Erro ao buscar horários. Tente novamente.');
    } finally {
      setBuscandoSlots(false);
    }
  }, [prof, dia, negocio.id, servico.id]);

  useEffect(() => {
    if (etapa === 'horario') buscarSlots();
  }, [etapa, buscarSlots]);

  async function confirmar() {
    if (!prof || !slot) return;
    if (nome.trim().length < 2) {
      setErro('Informe seu nome');
      return;
    }
    const digits = whatsapp.replace(/\D/g, '');
    if (digits.length < 10) {
      setErro('Informe um WhatsApp válido com DDD');
      return;
    }
    setEnviando(true);
    setErro(null);
    try {
      const resp = await fn.criarAgendamento({
        tenantId: negocio.id,
        profId: prof.id,
        servicoId: servico.id,
        inicioIso: slot,
        cliente: { nome: nome.trim(), whatsapp: digits },
      });
      setTokenGestao((resp.data as { token: string }).token);
      setEtapa('confirmado');
    } catch (e) {
      const msg =
        (e as { message?: string })?.message ??
        'Não foi possível agendar. Tente outro horário.';
      setErro(msg.replace(/^.*?:\s*/, ''));
      // Horário pode ter sido ocupado — atualiza a grade
      buscarSlots();
    } finally {
      setEnviando(false);
    }
  }

  const horaFmt = (iso: string) =>
    new Date(iso).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });

  const linkWhatsapp = useMemo(() => {
    if (!slot) return '#';
    const quando = new Date(slot).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
    const texto = encodeURIComponent(
      `Olá! Acabei de agendar *${servico.nome}* com ${prof?.nome} em ${quando}. Meu nome é ${nome.trim()}.`,
    );
    const num = negocio.telefoneWhatsapp.replace(/\D/g, '');
    return `https://wa.me/${num}?text=${texto}`;
  }, [slot, servico.nome, prof?.nome, nome, negocio.telefoneWhatsapp]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white p-6 sm:rounded-3xl">
        {/* Cabeçalho do modal */}
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">{servico.nome}</h3>
            <p className="text-sm text-neutral-500">
              {servico.duracaoMin} min · {formatarPreco(servico.precoCentavos)}
            </p>
          </div>
          <button
            onClick={aoFechar}
            aria-label="Fechar"
            className="rounded-full p-2 text-neutral-500 hover:bg-neutral-100"
          >
            ✕
          </button>
        </div>

        {etapa === 'profissional' && (
          <div className="flex flex-col gap-2">
            <p className="font-medium">Com quem?</p>
            {profissionais.length === 0 && (
              <p className="text-neutral-500">
                Nenhum profissional disponível para este serviço.
              </p>
            )}
            {profissionais.map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  setProf(p);
                  setEtapa('horario');
                }}
                className="flex items-center gap-3 rounded-xl border p-3 text-left hover:bg-neutral-50"
              >
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-full font-semibold text-white"
                  style={{ backgroundColor: 'var(--cor-primaria)' }}
                >
                  {p.nome.charAt(0)}
                </div>
                <span className="font-medium">{p.nome}</span>
              </button>
            ))}
          </div>
        )}

        {etapa === 'horario' && prof && (
          <div>
            <p className="font-medium">
              Escolha o dia e horário{' '}
              <span className="text-neutral-500">— com {prof.nome}</span>
            </p>

            {/* Dias */}
            <div className="mt-3 flex gap-2 overflow-x-auto pb-2">
              {dias.map((d) => {
                const ativo = d.toDateString() === dia.toDateString();
                return (
                  <button
                    key={d.toISOString()}
                    onClick={() => setDia(d)}
                    className={`flex min-w-14 flex-col items-center rounded-xl border px-3 py-2 text-sm ${
                      ativo ? 'text-white' : 'hover:bg-neutral-50'
                    }`}
                    style={
                      ativo
                        ? {
                            backgroundColor: 'var(--cor-primaria)',
                            borderColor: 'var(--cor-primaria)',
                          }
                        : undefined
                    }
                  >
                    <span className="capitalize">
                      {d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '')}
                    </span>
                    <span className="text-lg font-semibold">{d.getDate()}</span>
                  </button>
                );
              })}
            </div>

            {/* Slots */}
            <div className="mt-3 min-h-24">
              {buscandoSlots ? (
                <div className="flex justify-center py-6">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-800" />
                </div>
              ) : slots.length === 0 ? (
                <p className="py-6 text-center text-neutral-500">
                  Nenhum horário livre neste dia
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {slots.map((s) => {
                    const ativo = slot === s;
                    return (
                      <button
                        key={s}
                        onClick={() => setSlot(s)}
                        className={`rounded-lg border px-4 py-2 text-sm font-medium ${
                          ativo ? 'text-white' : 'hover:bg-neutral-50'
                        }`}
                        style={
                          ativo
                            ? {
                                backgroundColor: 'var(--cor-primaria)',
                                borderColor: 'var(--cor-primaria)',
                              }
                            : undefined
                        }
                      >
                        {horaFmt(s)}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <button
              disabled={!slot}
              onClick={() => setEtapa('dados')}
              className="mt-4 w-full rounded-xl py-3 font-semibold text-white disabled:opacity-40"
              style={{ backgroundColor: 'var(--cor-primaria)' }}
            >
              Continuar
            </button>
          </div>
        )}

        {etapa === 'dados' && (
          <div className="flex flex-col gap-3">
            <p className="font-medium">Quase lá! Seus dados:</p>
            <input
              className="rounded-xl border p-3"
              placeholder="Seu nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              autoFocus
            />
            <input
              className="rounded-xl border p-3"
              placeholder="WhatsApp com DDD (ex: 11 99999-0000)"
              inputMode="tel"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
            />
            {slot && (
              <p className="text-sm text-neutral-600">
                {servico.nome} com {prof?.nome} ·{' '}
                {new Date(slot).toLocaleString('pt-BR', {
                  weekday: 'long',
                  day: '2-digit',
                  month: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            )}
            {erro && <p className="text-sm text-red-600">{erro}</p>}
            <button
              disabled={enviando}
              onClick={confirmar}
              className="w-full rounded-xl py-3 font-semibold text-white disabled:opacity-40"
              style={{ backgroundColor: 'var(--cor-primaria)' }}
            >
              {enviando ? 'Confirmando…' : 'Confirmar agendamento'}
            </button>
            <button
              onClick={() => setEtapa('horario')}
              className="text-sm text-neutral-500 underline"
            >
              Voltar
            </button>
          </div>
        )}

        {etapa === 'confirmado' && (
          <div className="flex flex-col items-center gap-4 py-4 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl">
              ✅
            </div>
            <div>
              <h3 className="text-xl font-bold">Agendado!</h3>
              {slot && (
                <p className="mt-1 text-neutral-600">
                  {servico.nome} com {prof?.nome}
                  <br />
                  {new Date(slot).toLocaleString('pt-BR', {
                    weekday: 'long',
                    day: '2-digit',
                    month: 'long',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              )}
            </div>
            <a
              href={linkWhatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full rounded-xl bg-green-600 py-3 font-semibold text-white"
            >
              Confirmar no WhatsApp 📲
            </a>
            {tokenGestao && (
              <a
                href={`/a/${tokenGestao}`}
                className="text-sm text-neutral-500 underline"
              >
                Precisa cancelar ou remarcar? Use este link
              </a>
            )}
            <p className="text-xs text-neutral-400">
              Guarde o link acima — é por ele que você gerencia seu horário.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
