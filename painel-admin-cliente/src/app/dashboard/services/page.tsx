'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/lib/hooks/use-auth';
import { useServices } from '@/lib/hooks/use-services';
import { deleteService, updateService } from '@/lib/firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Package } from 'lucide-react';
import { formatPrice, formatDuration } from '@/lib/utils';

export default function ServicesPage() {
  const { tenant } = useAuth();
  const { services, refetch } = useServices(tenant?.id || null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este serviço?')) return;

    try {
      setDeletingId(id);
      await deleteService(id);
      await refetch();
    } catch (error) {
      console.error('Error deleting service:', error);
      alert('Erro ao excluir serviço');
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    try {
      await updateService(id, { active: !currentActive });
      await refetch();
    } catch (error) {
      console.error('Error toggling service:', error);
      alert('Erro ao atualizar serviço');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Serviços</h1>
          <p className="text-muted-foreground">Gerencie os serviços oferecidos</p>
        </div>
        <Link href="/dashboard/services/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Novo Serviço
          </Button>
        </Link>
      </div>

      {services.length === 0 ? (
        <Card className="p-12">
          <div className="flex flex-col items-center justify-center text-center space-y-4">
            <Package className="h-16 w-16 text-muted-foreground" />
            <div>
              <h3 className="text-lg font-semibold">Nenhum serviço cadastrado</h3>
              <p className="text-muted-foreground">
                Comece adicionando seu primeiro serviço
              </p>
            </div>
            <Link href="/dashboard/services/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Serviço
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <Card key={service.id} className="overflow-hidden">
              {service.imageUrl && (
                <div className="relative h-48 w-full">
                  <Image
                    src={service.imageUrl}
                    alt={service.name}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-lg">{service.name}</h3>
                  <Badge variant={service.active ? 'success' : 'secondary'}>
                    {service.active ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                  {service.description}
                </p>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{formatPrice(service.price)}</span>
                  <span className="text-muted-foreground">
                    {formatDuration(service.duration)}
                  </span>
                </div>
              </CardContent>
              <CardFooter className="p-4 pt-0 flex gap-2">
                <Link href={`/dashboard/services/${service.id}`} className="flex-1">
                  <Button variant="outline" className="w-full">
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  onClick={() => handleToggleActive(service.id, service.active)}
                >
                  {service.active ? 'Desativar' : 'Ativar'}
                </Button>
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => handleDelete(service.id)}
                  disabled={deletingId === service.id}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
