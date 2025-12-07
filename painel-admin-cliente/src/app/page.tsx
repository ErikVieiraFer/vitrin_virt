import { redirect } from 'next/navigation';

export default function RootPage() {
  // Redirecionar para a página de login
  // O middleware já faz isso, mas mantemos como fallback
  redirect('/login');
}
