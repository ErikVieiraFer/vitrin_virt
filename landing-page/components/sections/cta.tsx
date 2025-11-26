'use client';

import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FadeIn } from '@/components/animations/fade-in';
import { ScaleOnScroll } from '@/components/animations/scale-on-scroll';
import { ctaFinal } from '@/lib/content';

export function CTA() {
  return (
    <section className="py-24 bg-slate-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScaleOnScroll>
          <div className="relative">
            {/* Animated Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-accent-600 to-secondary-600 rounded-3xl animate-gradient" />

            {/* Glow Effects */}
            <div className="absolute -inset-1 bg-gradient-to-r from-primary-600 to-accent-600 rounded-3xl blur-2xl opacity-30 animate-pulse-slow" />

            {/* Content Container */}
            <div className="relative px-8 py-16 sm:px-12 sm:py-20 lg:px-16 lg:py-24 text-center">
              <FadeIn delay={0.1}>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium mb-6">
                  <Sparkles className="w-4 h-4" />
                  <span>Comece hoje mesmo</span>
                </div>
              </FadeIn>

              <FadeIn delay={0.2}>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-6 max-w-4xl mx-auto leading-tight">
                  {ctaFinal.title}
                </h2>
              </FadeIn>

              <FadeIn delay={0.3}>
                <p className="text-lg sm:text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                  {ctaFinal.subtitle}
                </p>
              </FadeIn>

              <FadeIn delay={0.4}>
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <Button
                    size="lg"
                    className="bg-white text-primary-600 hover:bg-slate-50 shadow-2xl group px-8 py-6 text-lg font-bold"
                  >
                    {ctaFinal.cta}
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </FadeIn>

              <FadeIn delay={0.5}>
                <p className="text-sm text-white/80 mt-6">
                  {ctaFinal.disclaimer}
                </p>
              </FadeIn>

              {/* Decorative Elements */}
              <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl animate-float" />
              <div className="absolute bottom-10 right-10 w-32 h-32 bg-white/10 rounded-full blur-xl animate-float" style={{ animationDelay: '1s' }} />
            </div>
          </div>
        </ScaleOnScroll>
      </div>
    </section>
  );
}
