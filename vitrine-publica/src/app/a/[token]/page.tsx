import { GestaoAgendamento } from './gestao-agendamento';

export default async function PaginaGestao({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  return <GestaoAgendamento token={token} />;
}
