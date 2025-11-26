import Link from 'next/link';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Building2, ExternalLink, Eye } from 'lucide-react';
import { Tenant, TenantStats } from '@/types/tenant';
import { formatDate } from '@/lib/utils';

interface TenantCardProps {
  tenant: Tenant;
  stats?: TenantStats;
}

export function TenantCard({ tenant, stats }: TenantCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          {/* Logo */}
          <div className="flex-shrink-0">
            {tenant.logo_url ? (
              <img
                src={tenant.logo_url}
                alt={tenant.name}
                className="h-16 w-16 rounded-full object-cover"
              />
            ) : (
              <div className="h-16 w-16 rounded-full bg-purple-100 flex items-center justify-center">
                <Building2 className="h-8 w-8 text-purple-600" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-semibold truncate">{tenant.name}</h3>
              <Badge variant={tenant.active ? 'success' : 'destructive'}>
                {tenant.active ? 'Ativo' : 'Inativo'}
              </Badge>
            </div>

            <p className="text-sm text-muted-foreground mb-1">
              <span className="font-medium">Subdomínio:</span> {tenant.subdomain}
            </p>

            <p className="text-sm text-muted-foreground mb-3">
              <span className="font-medium">WhatsApp:</span> {tenant.whatsapp}
            </p>

            {/* Stats */}
            {stats && (
              <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Serviços</p>
                  <p className="font-semibold">
                    {stats.active_services}/{stats.total_services}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Agendamentos</p>
                  <p className="font-semibold">{stats.total_bookings}</p>
                </div>
              </div>
            )}

            <p className="text-xs text-muted-foreground">
              Cadastrado em {formatDate(tenant.created_at.toDate())}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-4 pt-4 border-t">
          <Button asChild variant="outline" className="flex-1">
            <Link href={`/dashboard/tenants/${tenant.id}`}>
              <Eye className="h-4 w-4 mr-2" />
              Ver Detalhes
            </Link>
          </Button>

          <Button asChild variant="default" className="flex-1">
            <Link href={`/dashboard/tenants/${tenant.id}/impersonate`}>
              <ExternalLink className="h-4 w-4 mr-2" />
              Acessar Painel
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
