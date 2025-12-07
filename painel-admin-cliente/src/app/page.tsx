import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Redirecionando...',
};

export default function RootPage() {
  // O middleware redireciona para /login
  return (
    <div className="min-h-screen flex items-center justify-center">
      <p>Redirecionando...</p>
    </div>
  );
}
