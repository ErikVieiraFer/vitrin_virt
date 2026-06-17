'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { authedFetch } from '@/lib/api';

interface TenantView {
  id: string;
  name: string;
  subdomain: string;
  whatsapp: string;
  active: boolean;
}

export default function TenantDetailPage() {
  const params = useParams();
  const [tenant, setTenant] = useState<TenantView | null>(null);
  const [loading, setLoading] = useState(true);

  // Campos editáveis.
  const [name, setName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [active, setActive] = useState(true);

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'ok' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (params.id) fetchTenant(params.id as string);
  }, [params.id]);

  const fetchTenant = async (id: string) => {
    try {
      const res = await authedFetch(`/api/admin/get-tenant?id=${encodeURIComponent(id)}`);
      if (!res.ok) throw new Error('not found');
      const data = await res.json();
      const t: TenantView = data.tenant;
      setTenant(t);
      setName(t.name);
      setWhatsapp(t.whatsapp);
      setActive(t.active);
    } catch (error) {
      console.error('Error fetching tenant:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!tenant) return;
    setSaving(true);
    setMessage(null);
    try {
      const res = await authedFetch('/api/admin/update-tenant', {
        method: 'POST',
        body: JSON.stringify({ id: tenant.id, name, whatsapp, active }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erro ao salvar');
      }
      setMessage({ type: 'ok', text: 'Alterações salvas!' });
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Erro ao salvar',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600" />
      </div>
    );
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
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Subdomínio</Label>
                <Input value={tenant.subdomain} disabled />
                <p className="text-xs text-muted-foreground">O subdomínio não pode ser alterado.</p>
              </div>
              <div className="space-y-2">
                <Label>WhatsApp</Label>
                <Input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Status</Label>
                  <p className="text-sm text-muted-foreground">Cliente ativo no sistema</p>
                </div>
                <Switch checked={active} onCheckedChange={setActive} />
              </div>

              {message && (
                <div
                  className={`rounded-md border px-4 py-2 text-sm ${
                    message.type === 'ok'
                      ? 'border-green-200 bg-green-50 text-green-700'
                      : 'border-red-200 bg-red-50 text-red-600'
                  }`}
                >
                  {message.text}
                </div>
              )}

              <Button onClick={handleSave} disabled={saving}>
                {saving ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Salvar Alterações
              </Button>
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
