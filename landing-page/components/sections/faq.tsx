'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { FadeIn } from '@/components/animations/fade-in';
import { StaggerContainer, StaggerItem } from '@/components/animations/stagger-container';
import { faqs } from '@/lib/content';
import { cn } from '@/lib/utils';

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="py-24 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <FadeIn>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
              Perguntas Frequentes
            </h2>
          </FadeIn>
          <FadeIn delay={0.1}>
            <p className="text-lg text-slate-600">
              Tudo que você precisa saber sobre o Vitrine Virtual
            </p>
          </FadeIn>
        </div>

        {/* FAQ Accordion */}
        <StaggerContainer className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;

            return (
              <StaggerItem key={index}>
                <div
                  className={cn(
                    'border-2 rounded-xl overflow-hidden transition-all duration-300',
                    isOpen
                      ? 'border-primary-500 shadow-lg bg-primary-50/50'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  )}
                >
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    className="w-full px-6 py-5 flex items-center justify-between gap-4 text-left transition-colors"
                  >
                    <span className="font-semibold text-slate-900 text-lg">
                      {faq.question}
                    </span>
                    <ChevronDown
                      className={cn(
                        'w-5 h-5 text-primary-600 flex-shrink-0 transition-transform duration-300',
                        isOpen ? 'rotate-180' : ''
                      )}
                    />
                  </button>

                  <div
                    className={cn(
                      'overflow-hidden transition-all duration-300',
                      isOpen ? 'max-h-96' : 'max-h-0'
                    )}
                  >
                    <div className="px-6 pb-5 pt-2">
                      <p className="text-slate-700 leading-relaxed">{faq.answer}</p>
                    </div>
                  </div>
                </div>
              </StaggerItem>
            );
          })}
        </StaggerContainer>

        {/* Contact CTA */}
        <FadeIn delay={0.6}>
          <div className="mt-12 text-center p-8 bg-slate-50 rounded-2xl border border-slate-200">
            <p className="text-slate-700 mb-4">
              Ainda tem dúvidas? Estamos aqui para ajudar!
            </p>
            <a
              href="/contact"
              className="text-primary-600 hover:text-primary-700 font-semibold inline-flex items-center gap-2"
            >
              Entre em contato
              <ChevronDown className="w-4 h-4 -rotate-90" />
            </a>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
