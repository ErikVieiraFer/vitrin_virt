'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

export default function SettingsPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-3xl font-bold">Configurações</h1>

      <Card>
        <CardHeader>
          <CardTitle>Configurações Globais</CardTitle>
          <CardDescription>Gerencie as configurações do sistema</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Email de Suporte</Label>
            <Input type="email" placeholder="suporte@exemplo.com" />
          </div>
          <div className="space-y-2">
            <Label>Nome do Sistema</Label>
            <Input defaultValue="Vitrine Virtual" />
          </div>
          <Button>Salvar Configurações</Button>
        </CardContent>
      </Card>
    </div>
  );
}
