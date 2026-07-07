import { VitrineCliente } from './vitrine-cliente';

export default async function PaginaNegocio({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <VitrineCliente slug={slug} />;
}
