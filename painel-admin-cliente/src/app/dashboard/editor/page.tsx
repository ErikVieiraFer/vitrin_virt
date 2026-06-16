'use client';

import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/lib/hooks/use-auth';
import { updateTenant } from '@/lib/firebase/firestore';
import { uploadSectionImage } from '@/lib/firebase/storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ImageUpload } from '@/components/image-upload';
import {
  ArrowDown,
  ArrowUp,
  Trash2,
  Plus,
  Loader2,
  Save,
  X,
} from 'lucide-react';
import {
  SECTION_LABELS,
  createSection,
  type SectionType,
  type VitrineSection,
} from '@/types/section';

export default function EditorPage() {
  const { tenant } = useAuth();
  const [sections, setSections] = useState<VitrineSection[]>([]);
  const [addType, setAddType] = useState<SectionType>('hero');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'ok' | 'error'; text: string } | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (tenant) setSections(tenant.sections ?? []);
  }, [tenant]);

  // Envia o rascunho para a vitrine (preview ao vivo). O app Flutter em modo
  // ?preview=1 escuta este postMessage (Chunk 2/3). Debounce para não floodar.
  useEffect(() => {
    if (!tenant) return;
    const timer = setTimeout(() => {
      iframeRef.current?.contentWindow?.postMessage(
        {
          source: 'vitrine-editor',
          theme: tenant.themeSettings,
          sections,
        },
        '*'
      );
    }, 200);
    return () => clearTimeout(timer);
  }, [sections, tenant]);

  const addSection = () => {
    setSections((prev) => [...prev, createSection(addType, prev.length)]);
  };

  const removeSection = (id: string) => {
    setSections((prev) => prev.filter((s) => s.id !== id));
  };

  const moveSection = (index: number, dir: -1 | 1) => {
    setSections((prev) => {
      const next = [...prev];
      const target = index + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const updateData = (id: string, patch: Record<string, unknown>) => {
    setSections((prev) =>
      prev.map((s) =>
        s.id === id ? ({ ...s, data: { ...s.data, ...patch } } as VitrineSection) : s
      )
    );
  };

  const addGalleryImage = (id: string, url: string) => {
    setSections((prev) =>
      prev.map((s) =>
        s.id === id && s.type === 'gallery'
          ? { ...s, data: { ...s.data, images: [...s.data.images, url] } }
          : s
      )
    );
  };

  const removeGalleryImage = (id: string, index: number) => {
    setSections((prev) =>
      prev.map((s) =>
        s.id === id && s.type === 'gallery'
          ? { ...s, data: { ...s.data, images: s.data.images.filter((_, i) => i !== index) } }
          : s
      )
    );
  };

  const handleSave = async () => {
    if (!tenant) return;
    setSaving(true);
    setMessage(null);
    try {
      const ordered = sections.map((s, i) => ({ ...s, order: i }));
      await updateTenant(tenant.id, { sections: ordered });
      setMessage({ type: 'ok', text: 'Vitrine salva com sucesso!' });
    } catch (error) {
      console.error('Error saving sections:', error);
      setMessage({ type: 'error', text: 'Não foi possível salvar. Tente novamente.' });
    } finally {
      setSaving(false);
    }
  };

  if (!tenant) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const previewUrl = `https://${tenant.subdomain}.vitrinevirt.com/?preview=1`;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Editor da Vitrine</h1>
          <p className="text-muted-foreground">
            Monte as seções da sua página pública e veja o resultado ao lado.
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Salvar
        </Button>
      </div>

      {message && (
        <div
          className={`rounded-md border px-4 py-3 text-sm ${
            message.type === 'ok'
              ? 'border-green-500/50 bg-green-500/10 text-green-700'
              : 'border-destructive/50 bg-destructive/10 text-destructive'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Editor */}
        <div className="space-y-4">
          {sections.length === 0 && (
            <Card>
              <CardContent className="py-10 text-center text-muted-foreground">
                Nenhuma seção ainda. Adicione a primeira abaixo.
              </CardContent>
            </Card>
          )}

          {sections.map((section, index) => (
            <Card key={section.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-base">{SECTION_LABELS[section.type]}</CardTitle>
                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => moveSection(index, -1)}
                    disabled={index === 0}
                    title="Mover para cima"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => moveSection(index, 1)}
                    disabled={index === sections.length - 1}
                    title="Mover para baixo"
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeSection(section.id)}
                    title="Remover seção"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {section.type === 'hero' && (
                  <>
                    <div className="space-y-1">
                      <Label>Título</Label>
                      <Input
                        value={section.data.title}
                        onChange={(e) => updateData(section.id, { title: e.target.value })}
                        placeholder="Ex.: Bem-vindo à Barbearia do Zé"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>Subtítulo</Label>
                      <Textarea
                        value={section.data.subtitle}
                        onChange={(e) => updateData(section.id, { subtitle: e.target.value })}
                        rows={2}
                        placeholder="Cortes clássicos e modernos no coração da cidade"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>Texto do botão</Label>
                      <Input
                        value={section.data.ctaText ?? ''}
                        onChange={(e) => updateData(section.id, { ctaText: e.target.value })}
                        placeholder="Agendar"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>Imagem de fundo</Label>
                      <ImageUpload
                        value={section.data.imageUrl}
                        onChange={(url) => updateData(section.id, { imageUrl: url })}
                        onFileSelect={(file) => uploadSectionImage(tenant.id, file)}
                      />
                    </div>
                  </>
                )}

                {section.type === 'text' && (
                  <>
                    <div className="space-y-1">
                      <Label>Título</Label>
                      <Input
                        value={section.data.heading}
                        onChange={(e) => updateData(section.id, { heading: e.target.value })}
                        placeholder="Sobre nós"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>Texto</Label>
                      <Textarea
                        value={section.data.body}
                        onChange={(e) => updateData(section.id, { body: e.target.value })}
                        rows={4}
                        placeholder="Conte a história do seu negócio..."
                      />
                    </div>
                  </>
                )}

                {section.type === 'gallery' && (
                  <>
                    {section.data.images.length > 0 && (
                      <div className="grid grid-cols-3 gap-2">
                        {section.data.images.map((url, i) => (
                          <div key={i} className="relative aspect-square overflow-hidden rounded-md border border-border">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={url} alt={`Foto ${i + 1}`} className="h-full w-full object-cover" />
                            <button
                              type="button"
                              onClick={() => removeGalleryImage(section.id, i)}
                              className="absolute right-1 top-1 rounded-full bg-destructive p-1 text-destructive-foreground"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    <Label>Adicionar foto</Label>
                    <ImageUpload
                      value={undefined}
                      onChange={(url) => url && addGalleryImage(section.id, url)}
                      onFileSelect={(file) => uploadSectionImage(tenant.id, file)}
                    />
                  </>
                )}

                {section.type === 'services' && (
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={section.data.showPrices}
                      onChange={(e) => updateData(section.id, { showPrices: e.target.checked })}
                      className="h-4 w-4 rounded border-border"
                    />
                    Mostrar preços dos serviços
                  </label>
                )}
              </CardContent>
            </Card>
          ))}

          {/* Adicionar seção */}
          <Card>
            <CardContent className="flex items-center gap-2 py-4">
              <Select
                value={addType}
                onChange={(e) => setAddType(e.target.value as SectionType)}
                className="flex-1"
              >
                {(Object.keys(SECTION_LABELS) as SectionType[]).map((t) => (
                  <option key={t} value={t}>
                    {SECTION_LABELS[t]}
                  </option>
                ))}
              </Select>
              <Button variant="outline" onClick={addSection}>
                <Plus className="h-4 w-4" />
                Adicionar
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Preview */}
        <div className="lg:sticky lg:top-6 h-fit">
          <Card className="overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Pré-visualização</CardTitle>
              <p className="text-xs text-muted-foreground">
                Mostra a vitrine publicada. O preview ao vivo das edições é ativado após a
                atualização do app da vitrine.
              </p>
            </CardHeader>
            <CardContent className="p-0">
              <iframe
                ref={iframeRef}
                src={previewUrl}
                title="Pré-visualização da vitrine"
                className="h-[600px] w-full border-0"
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
