'use client';

import { X, Check, ArrowRight } from 'lucide-react';
import { FadeIn } from '@/components/animations/fade-in';

const before = [
  'Mensagem a toda hora perguntando horário',
  'Agenda no caderno (ou na cabeça)',
  'Cliente esquece e dá o famoso “furo”',
  'Você perde agendamento enquanto atende',
];

const after = [
  'Link profissional que agenda sozinho, 24h',
  'Tudo organizado num painel simples',
  'Lembrete automático no WhatsApp',
  'Mais horários cheios, menos faltas',
];

export function BeforeAfter() {
  return (
    <section className="bg-slate-50 py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-bold text-slate-900 sm:text-4xl">
              Do caos no WhatsApp para a agenda no automático
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              Veja a diferença que um link profissional faz no seu dia a dia.
            </p>
          </div>
        </FadeIn>

        <div className="mt-12 grid grid-cols-1 items-center gap-6 md:grid-cols-[1fr_auto_1fr]">
          {/* Antes */}
          <FadeIn direction="right">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <span className="inline-flex rounded-full bg-red-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-red-500">
                Antes
              </span>
              <ul className="mt-5 space-y-3">
                {before.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-slate-600">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-100">
                      <X className="h-3 w-3 text-red-500" />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </FadeIn>

          {/* Seta */}
          <div className="hidden justify-center md:flex">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-primary-600 to-accent-600 text-white shadow-glow">
              <ArrowRight className="h-5 w-5" />
            </div>
          </div>

          {/* Depois */}
          <FadeIn direction="left">
            <div className="rounded-2xl border-2 border-primary-200 bg-white p-6 shadow-lg shadow-primary-500/10">
              <span className="inline-flex rounded-full bg-green-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-green-600">
                Depois
              </span>
              <ul className="mt-5 space-y-3">
                {after.map((item) => (
                  <li key={item} className="flex items-start gap-3 font-medium text-slate-800">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-100">
                      <Check className="h-3 w-3 text-green-600" />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
