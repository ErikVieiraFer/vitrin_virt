'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/lib/hooks/use-auth';
import { getServiceById, updateService } from '@/lib/firebase/firestore';
import { uploadServiceImage } from '@/lib/firebase/storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ImageUpload } from '@/components/image-upload';
import { Loader2 } from 'lucide-react';
import type { Service } from '@/types/service';

export default function EditServicePage() {
  const router = useRouter();
  const params = useParams();
  const { tenant } = useAuth();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');
  const [service, setService] = useState<Service | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    duration: 30,
    price: 0,
    imageUrl: '',
    active: true,
  });

  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    if (params.id && typeof params.id === 'string') {
      fetchService(params.id);
    }
  }, [params.id]);

  const fetchService = async (id: string) => {
    try {
      const data = await getServiceById(id);
      if (data) {
        setService(data);
        setFormData({
          name: data.name,
          description: data.description,
          duration: data.duration,
          price: data.price,
          imageUrl: data.imageUrl || '',
          active: data.active,
        });
      } else {
        setError('Serviço não encontrado');
      }
    } catch (err) {
      console.error('Error fetching service:', err);
      setError('Erro ao carregar serviço');
    } finally {
      setFetching(false);
    }
  };

  const handleImageSelect = async (file: File): Promise<string> => {
    setImageFile(file);
    return URL.createObjectURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenant?.id || !service?.id) return;

    setError('');
    setLoading(true);

    try {
      // Validations
      if (formData.name.length < 3 || formData.name.length > 100) {
        setError('O nome deve ter entre 3 e 100 caracteres');
        setLoading(false);
        return;
      }

      if (formData.description.length < 10 || formData.description.length > 500) {
        setError('A descrição deve ter entre 10 e 500 caracteres');
        setLoading(false);
        return;
      }

      if (formData.duration < 5 || formData.duration > 300) {
        setError('A duração deve estar entre 5 e 300 minutos');
        setLoading(false);
        return;
      }

      if (formData.price <= 0) {
        setError('O preço deve ser maior que zero');
        setLoading(false);
        return;
      }

      let imageUrl = formData.imageUrl;

      // Upload new image if exists
      if (imageFile) {
        imageUrl = await uploadServiceImage(tenant.id, service.id, imageFile);
      }

      // Update service
      await updateService(service.id, {
        name: formData.name,
        description: formData.description,
        duration: formData.duration,
        price: formData.price,
        imageUrl,
        active: formData.active,
      });

      router.push('/dashboard/services');
    } catch (err) {
      console.error('Error updating service:', err);
      setError('Erro ao atualizar serviço. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value,
    }));
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">Serviço não encontrado</p>
            <Button onClick={() => router.push('/dashboard/services')} className="mt-4">
              Voltar para Serviços
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Editar Serviço</h1>
        <p className="text-muted-foreground">Atualize as informações do serviço</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações do Serviço</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Ex: Corte de Cabelo"
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição *</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Descreva o serviço oferecido..."
                rows={4}
                required
                disabled={loading}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="duration">Duração (minutos) *</Label>
                <Input
                  id="duration"
                  name="duration"
                  type="number"
                  min="5"
                  max="300"
                  step="5"
                  value={formData.duration}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Preço (R$) *</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Imagem do Serviço</Label>
              <ImageUpload
                value={formData.imageUrl}
                onChange={(url) => setFormData((prev) => ({ ...prev, imageUrl: url || '' }))}
                onFileSelect={handleImageSelect}
                maxSize={5}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="active"
                checked={formData.active}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, active: e.target.checked }))
                }
                disabled={loading}
              />
              <Label htmlFor="active" className="cursor-pointer">
                Serviço ativo (visível para clientes)
              </Label>
            </div>

            {error && (
              <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                {error}
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={loading}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Salvando...
                  </>
                ) : (
                  'Atualizar Serviço'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
