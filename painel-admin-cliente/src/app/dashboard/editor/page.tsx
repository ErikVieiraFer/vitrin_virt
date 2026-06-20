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
  SERVICE_CARD_STYLE_LABELS,
  createSection,
  type SectionType,
  type VitrineSection,
} from '@/types/section';
import { NICHE_TEMPLATES } from '@/lib/section-templates';

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
  // ?preview=1 escuta este postMessage. Enviamos como JSON string para um
  // parsing robusto no Dart. Debounce para não floodar.
  useEffect(() => {
    if (!tenant) return;
    const timer = setTimeout(() => {
      iframeRef.current?.contentWindow?.postMessage(
        JSON.stringify({
          source: 'vitrine-editor',
          theme: tenant.themeSettings,
          sections,
        }),
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

  // Em produção: subdomínio do tenant. Local (NEXT_PUBLIC_VITRINE_BASE_URL setado):
  // aponta para a vitrine Flutter rodando localmente, passando o tenant por query.
  const vitrineBase = process.env.NEXT_PUBLIC_VITRINE_BASE_URL;
  const previewUrl = vitrineBase
    ? `${vitrineBase}/?preview=1&tenant=${tenant.subdomain}`
    : `https://${tenant.subdomain}.vitrinevirt.com/?preview=1`;

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
              <CardContent className="space-y-4 py-8 text-center">
                <p className="text-sm text-muted-foreground">
                  Comece de um template pronto do seu nicho — ou monte do zero abaixo.
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {NICHE_TEMPLATES.map((tpl) => (
                    <Button
                      key={tpl.key}
                      variant="outline"
                      size="sm"
                      onClick={() => setSections(tpl.build())}
                    >
                      {tpl.label}
                    </Button>
                  ))}
                </div>
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
                  <>
                    <div className="space-y-1">
                      <Label>Estilo dos cards</Label>
                      <Select
                        value={section.data.cardStyle ?? 'classic'}
                        onChange={(e) => updateData(section.id, { cardStyle: e.target.value })}
                      >
                        {(
                          Object.keys(SERVICE_CARD_STYLE_LABELS) as (keyof typeof SERVICE_CARD_STYLE_LABELS)[]
                        ).map((style) => (
                          <option key={style} value={style}>
                            {SERVICE_CARD_STYLE_LABELS[style]}
                          </option>
                        ))}
                      </Select>
                    </div>
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={section.data.showPrices}
                        onChange={(e) => updateData(section.id, { showPrices: e.target.checked })}
                        className="h-4 w-4 rounded border-border"
                      />
                      Mostrar preços dos serviços
                    </label>
                  </>
                )}

                {section.type === 'cover' && (
                  <>
                    <div className="space-y-1">
                      <Label>Título</Label>
                      <Input
                        value={section.data.title}
                        onChange={(e) => updateData(section.id, { title: e.target.value })}
                        placeholder="Nome do seu negócio"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>Subtítulo</Label>
                      <Input
                        value={section.data.subtitle}
                        onChange={(e) => updateData(section.id, { subtitle: e.target.value })}
                        placeholder="Sua frase de efeito"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>Foto de capa</Label>
                      <ImageUpload
                        value={section.data.imageUrl}
                        onChange={(url) => updateData(section.id, { imageUrl: url })}
                        onFileSelect={(file) => uploadSectionImage(tenant.id, file)}
                      />
                    </div>
                  </>
                )}

                {section.type === 'testimonials' && (
                  <div className="space-y-3">
                    {section.data.items.map((item, i) => (
                      <div key={i} className="space-y-2 rounded-md border border-border p-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-muted-foreground">
                            Depoimento {i + 1}
                          </span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              updateData(section.id, {
                                items: section.data.items.filter((_, idx) => idx !== i),
                              })
                            }
                          >
                            <X className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                        <Input
                          value={item.name}
                          placeholder="Nome do cliente"
                          onChange={(e) => {
                            const items = [...section.data.items];
                            items[i] = { ...items[i], name: e.target.value };
                            updateData(section.id, { items });
                          }}
                        />
                        <Textarea
                          value={item.text}
                          rows={2}
                          placeholder="O que o cliente falou"
                          onChange={(e) => {
                            const items = [...section.data.items];
                            items[i] = { ...items[i], text: e.target.value };
                            updateData(section.id, { items });
                          }}
                        />
                        <Select
                          value={String(item.rating)}
                          onChange={(e) => {
                            const items = [...section.data.items];
                            items[i] = { ...items[i], rating: Number(e.target.value) };
                            updateData(section.id, { items });
                          }}
                        >
                          {[5, 4, 3, 2, 1].map((r) => (
                            <option key={r} value={r}>
                              {r} estrelas
                            </option>
                          ))}
                        </Select>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        updateData(section.id, {
                          items: [...section.data.items, { name: '', text: '', rating: 5 }],
                        })
                      }
                    >
                      <Plus className="h-4 w-4" />
                      Adicionar depoimento
                    </Button>
                  </div>
                )}

                {section.type === 'social' && (
                  <>
                    <div className="space-y-1">
                      <Label>WhatsApp (DDD + número)</Label>
                      <Input
                        value={section.data.whatsapp ?? ''}
                        onChange={(e) => updateData(section.id, { whatsapp: e.target.value })}
                        placeholder="5527998547188"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>Instagram (@ ou link)</Label>
                      <Input
                        value={section.data.instagram ?? ''}
                        onChange={(e) => updateData(section.id, { instagram: e.target.value })}
                        placeholder="@seunegocio"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>Facebook (link)</Label>
                      <Input
                        value={section.data.facebook ?? ''}
                        onChange={(e) => updateData(section.id, { facebook: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>TikTok (@ ou link)</Label>
                      <Input
                        value={section.data.tiktok ?? ''}
                        onChange={(e) => updateData(section.id, { tiktok: e.target.value })}
                      />
                    </div>
                  </>
                )}

                {section.type === 'hours' && (
                  <div className="space-y-2">
                    {section.data.items.map((item, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <Input
                          className="flex-1"
                          value={item.label}
                          placeholder="Seg a Sex"
                          onChange={(e) => {
                            const items = [...section.data.items];
                            items[i] = { ...items[i], label: e.target.value };
                            updateData(section.id, { items });
                          }}
                        />
                        <Input
                          className="flex-1"
                          value={item.value}
                          placeholder="09:00 - 19:00"
                          onChange={(e) => {
                            const items = [...section.data.items];
                            items[i] = { ...items[i], value: e.target.value };
                            updateData(section.id, { items });
                          }}
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            updateData(section.id, {
                              items: section.data.items.filter((_, idx) => idx !== i),
                            })
                          }
                        >
                          <X className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        updateData(section.id, {
                          items: [...section.data.items, { label: '', value: '' }],
                        })
                      }
                    >
                      <Plus className="h-4 w-4" />
                      Adicionar horário
                    </Button>
                  </div>
                )}

                {section.type === 'address' && (
                  <>
                    <div className="space-y-1">
                      <Label>Endereço</Label>
                      <Textarea
                        value={section.data.address}
                        rows={2}
                        placeholder="Rua, número, bairro, cidade"
                        onChange={(e) => updateData(section.id, { address: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>Link do mapa (Google Maps, opcional)</Label>
                      <Input
                        value={section.data.mapUrl ?? ''}
                        onChange={(e) => updateData(section.id, { mapUrl: e.target.value })}
                        placeholder="https://maps.app.goo.gl/..."
                      />
                    </div>
                  </>
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
