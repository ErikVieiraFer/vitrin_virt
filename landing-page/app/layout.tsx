import type { Metadata } from 'next';
import { Inter, Poppins } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  display: 'swap',
  variable: '--font-poppins',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://vitrinevirt.com'),
  title: 'Vitrine Virtual — Agenda cheia, sem responder WhatsApp o dia todo',
  description:
    'Sua barbearia, salão, estúdio ou clínica com um link profissional onde os clientes agendam sozinhos, 24h. Lembretes automáticos no WhatsApp reduzem faltas. Configure em 5 minutos.',
  keywords: [
    'agendamento online',
    'agenda para barbearia',
    'agendamento salão de beleza',
    'sistema de agendamento',
    'vitrine virtual',
    'agenda online whatsapp',
    'link de agendamento',
  ],
  authors: [{ name: 'Vitrine Virtual' }],
  creator: 'Vitrine Virtual',
  publisher: 'Vitrine Virtual',
  robots: 'index, follow',
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: 'https://vitrinevirt.com',
    title: 'Vitrine Virtual — Agenda cheia, sem responder WhatsApp o dia todo',
    description:
      'Seus clientes agendam sozinhos pelo seu link, 24h. Lembretes automáticos reduzem faltas. Configure em 5 minutos, sem cartão.',
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
    title: 'Vitrine Virtual — Agenda cheia, sem responder WhatsApp',
    description:
      'Seus clientes agendam sozinhos pelo seu link, 24h. Lembretes automáticos reduzem faltas.',
    images: ['/og-image.png'],
    creator: '@vitrinevirtofc',
  },
  verification: {
    google: 'google-site-verification-code',
  },
  alternates: {
    canonical: 'https://vitrinevirt.com',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${poppins.variable}`}>
      <head>
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="antialiased font-sans">{children}</body>
    </html>
  );
}
