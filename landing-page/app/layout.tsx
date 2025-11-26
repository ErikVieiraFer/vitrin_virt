import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Vitrine Virtual - Agendamentos Profissionais para Seu Negócio',
  description:
    'Plataforma completa de agendamentos personalizada para sua marca. Configure em minutos, agende em segundos. Transforme visitantes em clientes com uma experiência profissional.',
  keywords: [
    'agendamento online',
    'agenda virtual',
    'sistema de agendamento',
    'vitrine virtual',
    'agendamento profissional',
    'calendario online',
    'reservas online',
  ],
  authors: [{ name: 'Vitrine Virtual' }],
  creator: 'Vitrine Virtual',
  publisher: 'Vitrine Virtual',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: 'https://vitrinevirtual.com',
    title: 'Vitrine Virtual - Agendamentos Profissionais para Seu Negócio',
    description:
      'Plataforma completa de agendamentos personalizada para sua marca. Configure em minutos, agende em segundos.',
    siteName: 'Vitrine Virtual',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Vitrine Virtual',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Vitrine Virtual - Agendamentos Profissionais',
    description:
      'Plataforma completa de agendamentos personalizada para sua marca. Configure em minutos, agende em segundos.',
    images: ['/og-image.png'],
    creator: '@vitrinevirtual',
  },
  verification: {
    google: 'google-site-verification-code',
  },
  alternates: {
    canonical: 'https://vitrinevirtual.com',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={inter.variable}>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="antialiased font-sans">{children}</body>
    </html>
  );
}
