'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/hooks/use-auth';
import { updateTenant } from '@/lib/firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Copy, Loader2, User } from 'lucide-react';

export default function ProfilePage() {
  const { tenant } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: tenant?.name || '',
    whatsapp: tenant?.whatsapp || '',
  });

  const siteUrl = `https://${tenant?.subdomain}.seuapp.com`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenant?.id) return;

    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      // Validate WhatsApp format (optional but if provided, should be valid)
      if (formData.whatsapp && !formData.whatsapp.match(/^\+55\d{10,11}$/)) {
        setError('WhatsApp deve estar no formato +55XXXXXXXXXXX');
        setLoading(false);
        return;
      }

      await updateTenant(tenant.id, {
        name: formData.name,
        whatsapp: formData.whatsapp || undefined,
      });

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Erro ao salvar perfil. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(siteUrl);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Perfil</h1>
        <p className="text-muted-foreground">
          Gerencie as informações da sua empresa
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Dados da Empresa
            </CardTitle>
            <CardDescription>
              Atualize as informações básicas da sua empresa
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome da Empresa *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Minha Empresa"
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subdomain">Subdomínio</Label>
              <Input
                id="subdomain"
                value={tenant?.subdomain || ''}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                O subdomínio não pode ser alterado
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="whatsapp">WhatsApp (opcional)</Label>
              <Input
                id="whatsapp"
                name="whatsapp"
                type="tel"
                value={formData.whatsapp}
                onChange={handleChange}
                placeholder="+5511999999999"
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">
                Formato: +55 seguido do DDD e número (11 dígitos)
              </p>
            </div>

            <div className="space-y-2">
              <Label>Link do Site</Label>
              <div className="flex gap-2">
                <Input value={siteUrl} disabled className="bg-muted" />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={copyToClipboard}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Compartilhe este link com seus clientes
              </p>
            </div>

            {error && (
              <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                {error}
              </div>
            )}

            {success && (
              <div className="text-sm text-green-600 bg-green-50 p-3 rounded-md">
                Perfil atualizado com sucesso!
              </div>
            )}

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Salvando...
                </>
              ) : (
                'Salvar Alterações'
              )}
            </Button>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
