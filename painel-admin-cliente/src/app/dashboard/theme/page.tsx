'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/hooks/use-auth';
import { updateTenant } from '@/lib/firebase/firestore';
import { uploadTenantLogo } from '@/lib/firebase/storage';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ImageUpload } from '@/components/image-upload';
import { ColorPicker } from '@/components/color-picker';
import { Loader2, Palette } from 'lucide-react';
import type { ThemeSettings } from '@/types/tenant';

const FONT_OPTIONS = [
  { value: 'Inter', label: 'Inter' },
  { value: 'Roboto', label: 'Roboto' },
  { value: 'Poppins', label: 'Poppins' },
  { value: 'Montserrat', label: 'Montserrat' },
  { value: 'Open Sans', label: 'Open Sans' },
];

export default function ThemePage() {
  const { tenant } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [themeSettings, setThemeSettings] = useState<ThemeSettings>(
    tenant?.themeSettings || {
      primaryColor: '#3b82f6',
      secondaryColor: '#8b5cf6',
      fontFamily: 'Inter',
      logoUrl: '',
    }
  );

  const [logoFile, setLogoFile] = useState<File | null>(null);

  const handleLogoSelect = async (file: File): Promise<string> => {
    setLogoFile(file);
    return URL.createObjectURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenant?.id) return;

    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      let logoUrl = themeSettings.logoUrl;

      // Upload new logo if exists
      if (logoFile) {
        logoUrl = await uploadTenantLogo(tenant.id, logoFile);
      }

      // Update tenant with new theme settings
      await updateTenant(tenant.id, {
        themeSettings: {
          ...themeSettings,
          logoUrl,
        },
      });

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Error updating theme:', err);
      setError('Erro ao salvar tema. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Personalização</h1>
        <p className="text-muted-foreground">
          Personalize as cores e a aparência do seu site
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Tema do Site
            </CardTitle>
            <CardDescription>
              Customize as cores e a logo para combinar com sua marca
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Logo da Empresa</Label>
              <ImageUpload
                value={themeSettings.logoUrl}
                onChange={(url) =>
                  setThemeSettings((prev) => ({ ...prev, logoUrl: url || '' }))
                }
                onFileSelect={handleLogoSelect}
                maxSize={2}
              />
              <p className="text-xs text-muted-foreground">
                Recomendado: 400x400px, formato PNG ou JPG, máximo 2MB
              </p>
            </div>

            <ColorPicker
              label="Cor Primária"
              id="primary-color"
              value={themeSettings.primaryColor}
              onChange={(color) =>
                setThemeSettings((prev) => ({ ...prev, primaryColor: color }))
              }
            />

            <ColorPicker
              label="Cor Secundária"
              id="secondary-color"
              value={themeSettings.secondaryColor}
              onChange={(color) =>
                setThemeSettings((prev) => ({ ...prev, secondaryColor: color }))
              }
            />

            <div className="space-y-2">
              <Label htmlFor="font-family">Fonte</Label>
              <Select
                id="font-family"
                value={themeSettings.fontFamily}
                onChange={(e) =>
                  setThemeSettings((prev) => ({ ...prev, fontFamily: e.target.value }))
                }
                disabled={loading}
              >
                {FONT_OPTIONS.map((font) => (
                  <option key={font.value} value={font.value}>
                    {font.label}
                  </option>
                ))}
              </Select>
            </div>

            <div className="p-6 border rounded-lg space-y-4">
              <h3 className="font-semibold">Preview</h3>
              <div className="space-y-3">
                <div
                  className="h-12 rounded-md flex items-center justify-center text-white font-medium"
                  style={{
                    backgroundColor: themeSettings.primaryColor,
                    fontFamily: themeSettings.fontFamily,
                  }}
                >
                  Cor Primária
                </div>
                <div
                  className="h-12 rounded-md flex items-center justify-center text-white font-medium"
                  style={{
                    backgroundColor: themeSettings.secondaryColor,
                    fontFamily: themeSettings.fontFamily,
                  }}
                >
                  Cor Secundária
                </div>
                <p
                  className="text-center text-muted-foreground"
                  style={{ fontFamily: themeSettings.fontFamily }}
                >
                  Exemplo de texto com a fonte {themeSettings.fontFamily}
                </p>
              </div>
            </div>

            {error && (
              <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                {error}
              </div>
            )}

            {success && (
              <div className="text-sm text-green-600 bg-green-50 p-3 rounded-md">
                Tema atualizado com sucesso!
              </div>
            )}

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Salvando...
                </>
              ) : (
                'Salvar Tema'
              )}
            </Button>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
