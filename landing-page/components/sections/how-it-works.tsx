'use client';

import * as LucideIcons from 'lucide-react';
import { FadeIn } from '@/components/animations/fade-in';
import { steps } from '@/lib/content';

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <FadeIn>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
              Simples como 1, 2, 3
            </h2>
          </FadeIn>
          <FadeIn delay={0.1}>
            <p className="text-lg text-slate-600">
              Configure sua vitrine virtual em minutos e comece a receber agendamentos imediatamente
            </p>
          </FadeIn>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {steps.map((step, index) => {
            const Icon = LucideIcons[step.icon as keyof typeof LucideIcons] as React.ComponentType<{ className?: string }>;
            const isLast = index === steps.length - 1;

            return (
              <FadeIn key={step.number} delay={index * 0.2}>
                <div className="relative">
                  {/* Connecting Line - Desktop Only */}
                  {!isLast && (
                    <div className="hidden md:block absolute top-16 left-[60%] w-full h-0.5 bg-gradient-to-r from-primary-300 to-transparent -z-10" />
                  )}

                  <div className="text-center">
                    {/* Step Number */}
                    <div className="relative inline-flex mb-6">
                      <div className="absolute inset-0 bg-gradient-to-br from-primary-600 to-accent-600 rounded-2xl blur-lg opacity-30 animate-pulse-slow" />
                      <div className="relative w-32 h-32 bg-gradient-to-br from-primary-600 to-accent-600 rounded-2xl flex flex-col items-center justify-center text-white shadow-xl">
                        {Icon && <Icon className="w-10 h-10 mb-2" />}
                        <span className="text-2xl font-bold">0{step.number}</span>
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-2xl font-bold text-slate-900 mb-3">
                      {step.title}
                    </h3>

                    {/* Description */}
                    <p className="text-slate-600 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              </FadeIn>
            );
          })}
        </div>
      </div>
    </section>
  );
}
