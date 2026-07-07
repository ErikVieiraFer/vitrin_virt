import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Vitrine Virtual',
  description: 'Agende online em segundos — sem cadastro, sem aplicativo.',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-neutral-50 text-neutral-900 antialiased">
        {children}
      </body>
    </html>
  );
}
