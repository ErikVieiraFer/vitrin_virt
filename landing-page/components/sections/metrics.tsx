'use client';

import { metrics } from '@/lib/content';
import { FadeIn } from '@/components/animations/fade-in';

export function Metrics() {
  return (
    <section className="bg-gradient-to-r from-primary-600 to-accent-600 py-14">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 sm:px-6 lg:grid-cols-4 lg:px-8">
        {metrics.map((m, i) => (
          <FadeIn key={m.label} delay={i * 0.1}>
            <div className="text-center text-white">
              <p className="font-display text-4xl font-extrabold sm:text-5xl">{m.value}</p>
              <p className="mt-2 text-sm text-white/85">{m.label}</p>
            </div>
          </FadeIn>
        ))}
      </div>
    </section>
  );
}
