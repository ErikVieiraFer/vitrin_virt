'use client';

import { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useAuth } from '@/lib/hooks/use-auth';
import {
  fn,
  PLANOS,
  precoPorMesCentavos,
  formatarReais,
  type PlanoId,
  type Ciclo,
} from '@/lib/firebase/functions';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';

interface Assinatura {
  plano: PlanoId;
  ciclo: Ciclo;
  status: 'trial' | 'ativa' | 'inadimplente' | 'bloqueada' | 'cancelada';
  trialEndsAt?: { toDate(): Date };
  mpPreapprovalId?: string | null;
}

const STATUS_INFO: Record<
  Assinatura['status'],
  { label: string; cor: string; descricao: string }
> = {
  trial: {
    label: 'Período de teste',
    cor: 'text-blue-600 bg-blue-50',
    descricao: 'Aproveite todos os recursos gratuitamente.',
  },
  ativa: {
    label: 'Ativa',
    cor: 'text-green-600 bg-green-50',
    descricao: 'Sua assinatura está em dia. Obrigado!',
  },
  inadimplente: {
    label: 'Pagamento pendente',
    cor: 'text-amber-600 bg-amber-50',
    descricao: 'Não conseguimos cobrar seu cartão. Regularize para não perder o acesso.',
  },
  bloqueada: {
    label: 'Bloqueada',
    cor: 'text-red-600 bg-red-50',
    descricao: 'Assine um plano para reativar sua página de agendamento.',
  },
  cancelada: {
    label: 'Cancelada',
    cor: 'text-neutral-600 bg-neutral-100',
    descricao: 'Assine novamente quando quiser — seus dados continuam guardados.',
  },
};

export default function AssinaturaPage() {
  const { user, tenant } = useAuth();
  const [assinatura, setAssinatura] = useState<Assinatura | null>(null);
  const [ciclo, setCiclo] = useState<Ciclo>('mensal');
  const [processando, setProcessando] = useState<string | null>(null);
  const [erro, setErro] = useState('');
  const [tenantId, setTenantId] = useState<string | null>(null);

  // v2: tenantId vem dos custom claims; fallback pro tenant do hook legado
  useEffect(() => {
    if (!user) return;
    user.getIdTokenResult(true).then((t) => {
      const claim = t.claims?.tenantId as string | undefined;
      setTenantId(claim ?? (tenant as { id?: string } | null)?.id ?? null);
    });
  }, [user, tenant]);

  useEffect(() => {
    if (!tenantId) return;
    return onSnapshot(doc(db, 'tenants', tenantId), (snap) => {
      const a = snap.data()?.assinatura;
      if (a) setAssinatura(a as Assinatura);
    });
  }, [tenantId]);

  async function assinar(plano: PlanoId) {
    setProcessando(plano);
    setErro('');
    try {
      const resp = await fn.criarAssinatura({ plano, ciclo });
      // Redireciona para o checkout seguro do Mercado Pago
      window.location.href = resp.data.initPoint;
    } catch (e) {
      setErro((e as { message?: string })?.message ?? 'Erro ao iniciar assinatura');
      setProcessando(null);
    }
  }

  async function cancelar() {
    if (!confirm('Cancelar sua assinatura? Sua página de agendamento ficará indisponível.'))
      return;
    setProcessando('cancelar');
    setErro('');
    try {
      await fn.cancelarAssinatura({});
    } catch (e) {
      setErro((e as { message?: string })?.message ?? 'Erro ao cancelar');
    } finally {
      setProcessando(null);
    }
  }

  if (!user || !assinatura) {
    return (
      <div className="flex min-h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const info = STATUS_INFO[assinatura.status];
  const trialFim = assinatura.trialEndsAt?.toDate();
  const podeAssinar = ['trial', 'bloqueada', 'cancelada', 'inadimplente'].includes(
    assinatura.status
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Assinatura</h1>
        <p className="text-muted-foreground">
          Gerencie seu plano. O pagamento é processado com segurança pelo Mercado Pago —
          não armazenamos dados do seu cartão.
        </p>
      </div>

      {/* Status atual */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                Plano {PLANOS[assinatura.plano]?.nome ?? assinatura.plano}
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${info.cor}`}>
                  {info.label}
                </span>
              </CardTitle>
              <CardDescription className="mt-1">
                {info.descricao}
                {assinatura.status === 'trial' && trialFim && (
                  <> Teste termina em {trialFim.toLocaleDateString('pt-BR')}.</>
                )}
              </CardDescription>
            </div>
            {assinatura.status === 'ativa' && (
              <Button
                variant="outline"
                onClick={cancelar}
                disabled={processando !== null}
              >
                {processando === 'cancelar' && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Cancelar assinatura
              </Button>
            )}
          </div>
        </CardHeader>
      </Card>

      {erro && (
        <p className="flex items-center gap-2 text-sm text-red-600">
          <AlertTriangle className="h-4 w-4" /> {erro}
        </p>
      )}

      {podeAssinar && (
        <>
          {/* Seletor de ciclo */}
          <div className="flex gap-2">
            {(
              [
                ['mensal', 'Mensal'],
                ['semestral', 'Semestral −15%'],
                ['anual', 'Anual −30%'],
              ] as [Ciclo, string][]
            ).map(([c, label]) => (
              <Button
                key={c}
                variant={ciclo === c ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCiclo(c)}
              >
                {label}
              </Button>
            ))}
          </div>

          {/* Planos */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {(Object.keys(PLANOS) as PlanoId[]).map((p) => {
              const porMes = precoPorMesCentavos(p, ciclo);
              const atual = p === assinatura.plano;
              return (
                <Card key={p} className={atual ? 'border-primary' : ''}>
                  <CardHeader>
                    <CardTitle className="text-lg">{PLANOS[p].nome}</CardTitle>
                    <CardDescription>{PLANOS[p].limiteProfissionais}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <span className="text-2xl font-bold">{formatarReais(porMes)}</span>
                      <span className="text-sm text-muted-foreground">/mês</span>
                      {ciclo === 'mensal' && (
                        <p className="text-xs text-green-600">
                          1º mês por {formatarReais(Math.round(porMes / 2))} (50% off)
                        </p>
                      )}
                      {ciclo !== 'mensal' && (
                        <p className="text-xs text-muted-foreground">
                          cobrado {ciclo === 'anual' ? 'anualmente' : 'a cada 6 meses'}
                        </p>
                      )}
                    </div>
                    <Button
                      className="w-full"
                      disabled={processando !== null}
                      onClick={() => assinar(p)}
                    >
                      {processando === p ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                      )}
                      Assinar {PLANOS[p].nome}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <p className="text-xs text-muted-foreground">
            Você será redirecionado para o checkout seguro do Mercado Pago. A assinatura
            renova automaticamente e pode ser cancelada a qualquer momento nesta página.
          </p>
        </>
      )}
    </div>
  );
}
