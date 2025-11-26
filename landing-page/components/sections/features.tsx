'use client';

import * as LucideIcons from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { FadeIn } from '@/components/animations/fade-in';
import { StaggerContainer, StaggerItem } from '@/components/animations/stagger-container';
import { features } from '@/lib/content';

export function Features() {
  return (
    <section id="features" className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <FadeIn>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
              Tudo que você precisa em um só lugar
            </h2>
          </FadeIn>
          <FadeIn delay={0.1}>
            <p className="text-lg text-slate-600">
              Ferramentas profissionais para transformar a forma como você gerencia seus
              agendamentos
            </p>
          </FadeIn>
        </div>

        {/* Features Grid */}
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = LucideIcons[feature.icon as keyof typeof LucideIcons] as React.ComponentType<{ className?: string }>;

            return (
              <StaggerItem key={index}>
                <Card className="h-full hover:-translate-y-2 transition-all duration-300 group border-slate-200 hover:border-primary-300 hover:shadow-xl">
                  <CardContent className="p-6 space-y-4">
                    {/* Icon */}
                    <div className="w-14 h-14 bg-gradient-to-br from-primary-100 to-accent-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      {Icon && <Icon className="w-7 h-7 text-primary-600" />}
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-semibold text-slate-900">
                      {feature.title}
                    </h3>

                    {/* Description */}
                    <p className="text-slate-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      </div>
    </section>
  );
}
