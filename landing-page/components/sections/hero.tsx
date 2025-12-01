'use client';

import { ArrowRight, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FadeIn } from '@/components/animations/fade-in';
import { hero } from '@/lib/content';

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Animated Background Gradient */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[1000px] bg-gradient-to-br from-primary-200/40 via-accent-200/40 to-secondary-200/40 rounded-full blur-3xl animate-gradient" />
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-gradient-to-br from-accent-300/30 to-primary-300/30 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-br from-secondary-300/30 to-accent-300/30 rounded-full blur-3xl"
          style={{ animationDelay: '1s' }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex flex-col items-center justify-center">
          {/* Content */}
          <div className="space-y-8 text-center max-w-4xl">
            <FadeIn delay={0.1}>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight text-slate-900">
                {hero.title}
              </h1>
            </FadeIn>

            <FadeIn delay={0.2}>
              <p className="text-lg sm:text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto">
                {hero.subtitle}
              </p>
            </FadeIn>

            <FadeIn delay={0.3}>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a href="https://painel.vitrinevirt.com">
                  <Button size="lg" className="group">
                    {hero.ctaPrimary}
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </a>
                <a href="https://app.vitrinevirt.com">
                  <Button variant="outline" size="lg" className="group">
                    <Play className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                    {hero.ctaSecondary}
                  </Button>
                </a>
              </div>
            </FadeIn>

            <FadeIn delay={0.4}>
              <p className="text-sm text-slate-500 flex items-center justify-center gap-2">
                {hero.socialProof}
              </p>
            </FadeIn>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-slate-400 rounded-full flex items-start justify-center p-2">
          <div className="w-1 h-3 bg-slate-400 rounded-full" />
        </div>
      </div>
    </section>
  );
}
