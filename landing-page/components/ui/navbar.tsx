'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X } from 'lucide-react';
import { Button } from './button';
import { cn } from '@/lib/utils';

const navItems = [
  { label: 'Recursos', href: '#features' },
  { label: 'Como Funciona', href: '#how-it-works' },
  { label: 'Preços', href: '#pricing' },
  { label: 'FAQ', href: '#faq' },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        isScrolled
          ? 'bg-white/80 backdrop-blur-lg shadow-lg border-b border-slate-200'
          : 'bg-transparent'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Image src="/logo.png" alt="Vitrine Virtual" width={40} height={40} className="rounded-lg" />
            <span
              className={cn(
                'text-xl font-bold transition-colors',
                isScrolled ? 'text-slate-900' : 'text-white'
              )}
            >
              Vitrine Virtual
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className={cn(
                  'transition-colors font-medium',
                  isScrolled
                    ? 'text-slate-600 hover:text-primary-600'
                    : 'text-slate-200 hover:text-white'
                )}
              >
                {item.label}
              </a>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <a href="https://painel.vitrinevirt.com/login" target="_blank" rel="noopener noreferrer">
              <Button
                variant="ghost"
                size="sm"
                className={cn(!isScrolled && 'text-white hover:bg-white/10 hover:text-white')}
              >
                Login
              </Button>
            </a>
            <a href="https://painel.vitrinevirt.com/register" target="_blank" rel="noopener noreferrer">
              <Button size="sm">Começar Grátis</Button>
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            className={cn(
              'md:hidden p-2 rounded-lg transition-colors',
              isScrolled ? 'hover:bg-slate-100' : 'hover:bg-white/10'
            )}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className={cn('w-6 h-6', isScrolled ? 'text-slate-900' : 'text-white')} />
            ) : (
              <Menu className={cn('w-6 h-6', isScrolled ? 'text-slate-900' : 'text-white')} />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-200 bg-white/95 backdrop-blur-lg rounded-b-2xl">
            <div className="flex flex-col space-y-4">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="text-slate-600 hover:text-primary-600 transition-colors font-medium px-2 py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.label}
                </a>
              ))}
              <div className="flex flex-col space-y-2 pt-4 border-t border-slate-200">
                <a href="https://painel.vitrinevirt.com/login" target="_blank" rel="noopener noreferrer">
                  <Button variant="ghost" size="sm" className="w-full">
                    Login
                  </Button>
                </a>
                <a href="https://painel.vitrinevirt.com/register" target="_blank" rel="noopener noreferrer">
                  <Button size="sm" className="w-full">
                    Começar Grátis
                  </Button>
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
