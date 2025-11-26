'use client';

import { useState } from 'react';
import { Check, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FadeIn } from '@/components/animations/fade-in';
import { StaggerContainer, StaggerItem } from '@/components/animations/stagger-container';
import { pricingPlans } from '@/lib/content';

export function Pricing() {
  const [isYearly, setIsYearly] = useState(false);

  return (
    <section id="pricing" className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <FadeIn>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
              Planos para todos os tamanhos
            </h2>
          </FadeIn>
          <FadeIn delay={0.1}>
            <p className="text-lg text-slate-600 mb-8">
              Escolha o plano perfeito para o seu negócio. Cancele quando quiser.
            </p>
          </FadeIn>

          {/* Toggle */}
          <FadeIn delay={0.2}>
            <div className="inline-flex items-center gap-4 bg-white p-2 rounded-xl shadow-sm border border-slate-200">
              <button
                onClick={() => setIsYearly(false)}
                className={`px-6 py-2 rounded-lg font-medium transition-all ${
                  !isYearly
                    ? 'bg-gradient-to-r from-primary-600 to-accent-600 text-white shadow-lg'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Mensal
              </button>
              <button
                onClick={() => setIsYearly(true)}
                className={`px-6 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                  isYearly
                    ? 'bg-gradient-to-r from-primary-600 to-accent-600 text-white shadow-lg'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Anual
                <Badge className="bg-green-100 text-green-700 border-green-200">
                  -20%
                </Badge>
              </button>
            </div>
          </FadeIn>
        </div>

        {/* Pricing Cards */}
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {pricingPlans.map((plan) => {
            const price = isYearly ? plan.priceYearly : plan.price;

            return (
              <StaggerItem key={plan.name}>
                <Card
                  className={`h-full relative transition-all duration-300 ${
                    plan.highlighted
                      ? 'border-2 border-primary-500 shadow-2xl scale-105 hover:scale-110'
                      : 'border-slate-200 hover:border-primary-300 hover:shadow-xl hover:-translate-y-2'
                  }`}
                >
                  {plan.highlighted && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                      <Badge className="bg-gradient-to-r from-primary-600 to-accent-600 text-white border-0 px-4 py-1 shadow-lg">
                        <Sparkles className="w-3 h-3 mr-1 inline" />
                        Mais Popular
                      </Badge>
                    </div>
                  )}

                  <CardHeader className="text-center pb-8 pt-8">
                    <CardTitle className="text-2xl mb-2">{plan.name}</CardTitle>
                    <p className="text-slate-600 text-sm mb-4">{plan.description}</p>
                    <div className="mb-6">
                      {price === 0 && plan.name === 'Enterprise' ? (
                        <div className="text-3xl font-bold text-slate-900">
                          Consulte-nos
                        </div>
                      ) : (
                        <>
                          <div className="text-5xl font-bold text-slate-900">
                            {price === 0 ? 'R$ 0' : `R$ ${price}`}
                          </div>
                          <div className="text-slate-600 text-sm mt-1">
                            {isYearly ? 'por ano' : 'por mês'}
                          </div>
                        </>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-6">
                    {/* Features List */}
                    <ul className="space-y-3">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-5 h-5 bg-gradient-to-br from-primary-600 to-accent-600 rounded-full flex items-center justify-center mt-0.5">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                          <span className="text-slate-700 text-sm leading-relaxed">
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>

                    {/* CTA Button */}
                    <Button
                      className="w-full"
                      variant={plan.highlighted ? 'primary' : 'outline'}
                      size="lg"
                    >
                      {plan.cta}
                    </Button>
                  </CardContent>
                </Card>
              </StaggerItem>
            );
          })}
        </StaggerContainer>

        {/* Additional Info */}
        <FadeIn delay={0.5}>
          <p className="text-center text-slate-600 mt-12">
            Todos os planos incluem suporte técnico e atualizações gratuitas.{' '}
            <a href="#" className="text-primary-600 hover:text-primary-700 font-medium">
              Compare os planos →
            </a>
          </p>
        </FadeIn>
      </div>
    </section>
  );
}
