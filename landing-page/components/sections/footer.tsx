'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Instagram, MessageCircle } from 'lucide-react';
import { footer } from '@/lib/content';

const socialLinks = [
  { name: 'Instagram', url: 'https://instagram.com/vitrinevirtual', icon: Instagram },
  { name: 'WhatsApp', url: 'https://wa.me/5527999999999', icon: MessageCircle },
];

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="flex flex-col items-center text-center">
          {/* Logo & Description */}
          <Link href="/" className="flex items-center space-x-2 mb-4">
            <Image src="/logo.png" alt="Vitrine Virtual" width={40} height={40} className="rounded-lg" />
            <span className="text-xl font-bold text-white">Vitrine Virtual</span>
          </Link>
          <p className="text-slate-400 mb-6 max-w-sm">{footer.description}</p>

          {/* Social Links */}
          <div className="flex gap-4 mb-8">
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

          {/* Copyright */}
          <p className="text-slate-400 text-sm">{footer.copyright}</p>
        </div>
      </div>
    </footer>
  );
}
