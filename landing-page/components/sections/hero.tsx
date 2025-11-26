'use client';

import { ArrowRight, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FadeIn } from '@/components/animations/fade-in';
import { ScaleOnScroll } from '@/components/animations/scale-on-scroll';
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Content */}
          <div className="space-y-8 text-center lg:text-left">
            <FadeIn delay={0.1}>
              <Badge className="inline-flex">{hero.badge}</Badge>
            </FadeIn>

            <FadeIn delay={0.2}>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight text-slate-900">
                {hero.title}
              </h1>
            </FadeIn>

            <FadeIn delay={0.3}>
              <p className="text-lg sm:text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                {hero.subtitle}
              </p>
            </FadeIn>

            <FadeIn delay={0.4}>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button size="lg" className="group">
                  {hero.ctaPrimary}
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button variant="outline" size="lg" className="group">
                  <Play className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                  {hero.ctaSecondary}
                </Button>
              </div>
            </FadeIn>

            <FadeIn delay={0.5}>
              <p className="text-sm text-slate-500 flex items-center justify-center lg:justify-start gap-2">
                {hero.socialProof}
              </p>
            </FadeIn>
          </div>

          {/* Right Column - Mockup */}
          <div className="relative lg:h-[600px] flex items-center justify-center">
            <ScaleOnScroll delay={0.3}>
              <div className="relative">
                {/* Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary-500/20 via-accent-500/20 to-secondary-500/20 rounded-3xl blur-3xl" />

                {/* Mockup Container */}
                <div className="relative bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 shadow-2xl border border-slate-700 transform hover:scale-105 transition-transform duration-500">
                  {/* Browser-like Header */}
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                  </div>

                  {/* Mockup Content */}
                  <div className="space-y-4">
                    <div className="h-8 bg-gradient-to-r from-primary-600 to-accent-600 rounded-lg w-3/4" />
                    <div className="h-4 bg-slate-700 rounded w-full" />
                    <div className="h-4 bg-slate-700 rounded w-5/6" />

                    <div className="grid grid-cols-3 gap-4 mt-6">
                      <div className="h-24 bg-gradient-to-br from-primary-600/20 to-accent-600/20 rounded-lg border border-primary-500/30" />
                      <div className="h-24 bg-gradient-to-br from-secondary-600/20 to-primary-600/20 rounded-lg border border-secondary-500/30" />
                      <div className="h-24 bg-gradient-to-br from-accent-600/20 to-secondary-600/20 rounded-lg border border-accent-500/30" />
                    </div>

                    <div className="mt-6 space-y-3">
                      <div className="h-12 bg-gradient-to-r from-primary-600 to-accent-600 rounded-lg flex items-center justify-center text-white font-semibold">
                        Agendar Agora
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </ScaleOnScroll>
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
