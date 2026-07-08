'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Instagram, MessageCircle } from 'lucide-react';
import { footer } from '@/lib/content';

const socialLinks = [
  { name: 'Instagram', url: 'https://www.instagram.com/vitrinevirtofc', icon: Instagram },
  { name: 'WhatsApp', url: 'https://wa.me/5527998547188', icon: MessageCircle },
];

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Marca */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <Image src="/logo.png" alt="Vitrine Virtual" width={40} height={40} className="rounded-lg" />
              <span className="text-xl font-bold text-white">Vitrine Virtual</span>
            </Link>
            <p className="text-slate-400 mb-6 max-w-sm text-sm leading-relaxed">
              {footer.description}
            </p>
            <div className="flex gap-3">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-slate-800 hover:bg-slate-700 rounded-lg flex items-center justify-center transition-colors"
                    aria-label={social.name}
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Produto */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-4">
              Produto
            </h3>
            <ul className="space-y-3">
              {footer.links.product.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-slate-300 hover:text-white transition-colors text-sm"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Suporte */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-4">
              Suporte
            </h3>
            <ul className="space-y-3">
              {footer.links.support.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target={link.href.startsWith('http') ? '_blank' : undefined}
                    rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    className="text-slate-300 hover:text-white transition-colors text-sm"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-slate-800 pt-8">
          <p className="text-slate-500 text-sm text-center">{footer.copyright}</p>
        </div>
      </div>
    </footer>
  );
}
