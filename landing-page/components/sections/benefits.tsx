'use client';

import { Check } from 'lucide-react';
import { FadeIn } from '@/components/animations/fade-in';
import { benefits } from '@/lib/content';

export function Benefits() {
  return (
    <section className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-32">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${
                benefit.reverse ? 'lg:grid-flow-dense' : ''
              }`}
            >
              {/* Image Column */}
              <FadeIn
                delay={0.2}
                direction={benefit.reverse ? 'right' : 'left'}
                className={benefit.reverse ? 'lg:col-start-2' : ''}
              >
                <div className="relative">
                  {/* Glow Effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary-500/20 via-accent-500/20 to-secondary-500/20 rounded-3xl blur-3xl" />

                  {/* Image Placeholder */}
                  <div className="relative bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl aspect-square flex items-center justify-center border border-slate-300 shadow-2xl">
                    <div className="text-center p-8">
                      <div className="w-24 h-24 mx-auto bg-gradient-to-br from-primary-600 to-accent-600 rounded-2xl flex items-center justify-center mb-4">
                        <span className="text-4xl text-white font-bold">{index + 1}</span>
                      </div>
                      <p className="text-slate-600 font-medium">
                        Mockup Visual
                      </p>
                    </div>
                  </div>
                </div>
              </FadeIn>

              {/* Content Column */}
              <div className={benefit.reverse ? 'lg:col-start-1 lg:row-start-1' : ''}>
                <FadeIn delay={0.3} direction={benefit.reverse ? 'left' : 'right'}>
                  <div className="space-y-6">
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900">
                      {benefit.title}
                    </h2>

                    <p className="text-lg text-slate-600 leading-relaxed">
                      {benefit.description}
                    </p>

                    <ul className="space-y-4">
                      {benefit.items.map((item, itemIndex) => (
                        <li key={itemIndex} className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-primary-600 to-accent-600 rounded-full flex items-center justify-center mt-0.5">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                          <span className="text-slate-700 text-base leading-relaxed">
                            {item}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </FadeIn>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
