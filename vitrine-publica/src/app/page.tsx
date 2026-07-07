export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-3xl font-bold">Vitrine Virtual</h1>
      <p className="max-w-md text-neutral-600">
        Cada negócio tem seu próprio endereço de agendamento. Peça o link ao seu
        prestador de serviço ou acesse pelo endereço{' '}
        <span className="font-mono">nome-do-negocio.vitrinevirtual.com.br</span>
      </p>
    </main>
  );
}
