'use client';

import { MessageCircle, CalendarCheck, QrCode, Banknote, type LucideIcon } from 'lucide-react';
import { integrations } from '@/lib/content';
import { FadeIn } from '@/components/animations/fade-in';

const iconMap: Record<string, LucideIcon> = {
  MessageCircle,
  CalendarCheck,
  QrCode,
  Banknote,
};

export function Integrations() {
  return (
    <section className="bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-bold text-slate-900 sm:text-4xl">
              Conectado com o que você já usa
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              Sem complicação: a Vitrine Virtual se encaixa na sua rotina.
            </p>
          </div>
        </FadeIn>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {integrations.map((item, i) => {
            const Icon = iconMap[item.icon] ?? MessageCircle;
            return (
              <FadeIn key={item.name} delay={i * 0.1}>
                <div className="h-full rounded-2xl border border-slate-200 bg-white p-6 transition-all hover:-translate-y-1 hover:border-primary-300 hover:shadow-lg">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary-100 to-accent-100">
                    <Icon className="h-6 w-6 text-primary-600" />
                  </div>
                  <h3 className="mt-4 font-semibold text-slate-900">{item.name}</h3>
                  <p className="mt-1 text-sm text-slate-600">{item.description}</p>
                </div>
              </FadeIn>
            );
          })}
        </div>
      </div>
    </section>
  );
}
