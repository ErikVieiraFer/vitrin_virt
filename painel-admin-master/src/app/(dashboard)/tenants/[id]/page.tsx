'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { Tenant } from '@/types/tenant';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

export default function TenantDetailPage() {
  const params = useParams();
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchTenant(params.id as string);
    }
  }, [params.id]);

  const fetchTenant = async (id: string) => {
    try {
      const tenantDoc = await getDoc(doc(db, 'tenants', id));
      if (tenantDoc.exists()) {
        setTenant({ id: tenantDoc.id, ...tenantDoc.data() } as Tenant);
      }
    } catch (error) {
      console.error('Error fetching tenant:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600" /></div>;
  }

  if (!tenant) {
    return <div className="text-center p-12">Cliente não encontrado</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <Button asChild variant="ghost" className="mb-4">
          <Link href="/dashboard/tenants"><ArrowLeft className="h-4 w-4 mr-2" />Voltar</Link>
        </Button>
        <h1 className="text-3xl font-bold">{tenant.name}</h1>
        <p className="text-muted-foreground mt-1">Gerencie as informações do cliente</p>
      </div>

      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">Geral</TabsTrigger>
          <TabsTrigger value="services">Serviços</TabsTrigger>
          <TabsTrigger value="bookings">Agendamentos</TabsTrigger>
          <TabsTrigger value="stats">Estatísticas</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Informações Gerais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Nome</Label>
                <Input defaultValue={tenant.name} />
              </div>
              <div className="space-y-2">
                <Label>Subdomínio</Label>
                <Input defaultValue={tenant.subdomain} />
              </div>
              <div className="space-y-2">
                <Label>WhatsApp</Label>
                <Input defaultValue={tenant.whatsapp} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Status</Label>
                  <p className="text-sm text-muted-foreground">Cliente ativo no sistema</p>
                </div>
                <Switch checked={tenant.active} />
              </div>
              <Button><Save className="h-4 w-4 mr-2" />Salvar Alterações</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="services">
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">Lista de serviços em desenvolvimento</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bookings">
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">Lista de agendamentos em desenvolvimento</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats">
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">Estatísticas em desenvolvimento</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
