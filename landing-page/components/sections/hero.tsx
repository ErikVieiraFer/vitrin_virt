'use client';

import { ArrowRight, Play, Check, Star, Scissors, Calendar } from 'lucide-react';
import { FadeIn } from '@/components/animations/fade-in';
import { hero, niches } from '@/lib/content';

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-slate-950 pt-28 pb-20 sm:pt-32">
      {/* Fundo: grid + glows */}
      <div className="absolute inset-0 -z-10 bg-grid" />
      <div className="absolute inset-0 -z-10 hero-glow" />
      <div className="absolute -top-24 left-1/2 -z-10 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-primary-600/20 blur-3xl" />
      <div className="absolute bottom-0 right-0 -z-10 h-80 w-80 rounded-full bg-accent-500/20 blur-3xl" />

      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
        {/* Texto */}
        <div className="text-center lg:text-left">
          <FadeIn delay={0.05}>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-sm text-slate-200 backdrop-blur">
              <Star className="h-3.5 w-3.5 text-accent-400" />
              {hero.badge}
            </span>
          </FadeIn>

          <FadeIn delay={0.1}>
            <h1 className="font-display mt-6 text-4xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-6xl">
              Agenda cheia,{' '}
              <span className="text-gradient-light">sem responder WhatsApp</span> o dia todo
            </h1>
          </FadeIn>

          <FadeIn delay={0.2}>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-slate-300 lg:mx-0">
              {hero.subtitle}
            </p>
          </FadeIn>

          <FadeIn delay={0.3}>
            <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row lg:justify-start">
              <a
                href="https://painel.vitrinevirt.com/register"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-primary-500 to-accent-500 px-8 py-4 text-lg font-semibold text-white shadow-glow transition-all hover:from-primary-400 hover:to-accent-400"
              >
                {hero.ctaPrimary}
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </a>
              <a
                href="https://demo.vitrinevirt.com/#/home"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center justify-center gap-2 rounded-lg border border-white/20 bg-white/5 px-8 py-4 text-lg font-medium text-white backdrop-blur transition-all hover:bg-white/10"
              >
                <Play className="h-5 w-5 transition-transform group-hover:scale-110" />
                {hero.ctaSecondary}
              </a>
            </div>
          </FadeIn>

          <FadeIn delay={0.4}>
            <div className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-slate-400 lg:justify-start">
              {hero.proofs.map((proof) => (
                <span key={proof} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-400" />
                  {proof}
                </span>
              ))}
            </div>
          </FadeIn>
        </div>

        {/* Mockup do app (CSS, sem imagem) */}
        <FadeIn delay={0.25} direction="left">
          <div className="relative mx-auto w-[280px] sm:w-[320px]">
            <div className="absolute -inset-6 -z-10 rounded-[3rem] bg-gradient-to-tr from-primary-500/40 to-accent-500/40 blur-2xl" />
            <PhoneMockup />
          </div>
        </FadeIn>
      </div>

      {/* Faixa de nichos */}
      <div className="mx-auto mt-16 max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeIn delay={0.2}>
          <p className="text-center text-xs font-medium uppercase tracking-widest text-slate-500">
            Feito para o seu negócio
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm font-medium text-slate-400">
            {niches.map((n) => (
              <span key={n}>{n}</span>
            ))}
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

/** Mockup de celular mostrando a vitrine de agendamento (puro CSS/Tailwind). */
function PhoneMockup() {
  const slots = ['09:00', '09:30', '10:00', '10:30', '11:00', '14:00'];
  return (
    <div className="animate-float rounded-[2.5rem] border-[10px] border-slate-800 bg-white shadow-2xl">
      <div className="overflow-hidden rounded-[1.8rem]">
        {/* Header da vitrine */}
        <div className="bg-gradient-to-r from-primary-600 to-accent-600 px-5 pb-6 pt-7 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/20">
              <Scissors className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold leading-tight">Barbearia do Zé</p>
              <p className="text-xs text-white/80">Aberto · Seg a Sáb</p>
            </div>
          </div>
        </div>

        <div className="space-y-4 px-5 py-5">
          {/* Serviço selecionado */}
          <div className="flex items-center justify-between rounded-xl border border-slate-200 p-3">
            <div>
              <p className="text-sm font-semibold text-slate-800">Corte + Barba</p>
              <p className="text-xs text-slate-500">45 min</p>
            </div>
            <span className="text-sm font-bold text-primary-600">R$ 50</span>
          </div>

          {/* Data */}
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Calendar className="h-4 w-4 text-primary-600" />
            Hoje, 12 de junho
          </div>

          {/* Horários */}
          <div className="grid grid-cols-3 gap-2">
            {slots.map((s, i) => (
              <div
                key={s}
                className={`rounded-lg py-2 text-center text-xs font-medium ${
                  i === 2
                    ? 'bg-primary-600 text-white'
                    : 'border border-slate-200 text-slate-600'
                }`}
              >
                {s}
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="rounded-xl bg-gradient-to-r from-primary-600 to-accent-600 py-3 text-center text-sm font-semibold text-white">
            Confirmar via WhatsApp
          </div>
        </div>
      </div>
    </div>
  );
}
