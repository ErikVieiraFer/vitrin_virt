import { Badge } from './ui/badge';
import { BookingStatus } from '@/types/booking';

interface TenantStatusBadgeProps {
  status: BookingStatus;
}

export function TenantStatusBadge({ status }: TenantStatusBadgeProps) {
  const variants: Record<BookingStatus, any> = {
    pending: { variant: 'warning' as const, label: 'Pendente' },
    confirmed: { variant: 'success' as const, label: 'Confirmado' },
    cancelled: { variant: 'destructive' as const, label: 'Cancelado' },
    completed: { variant: 'secondary' as const, label: 'Concluído' },
  };

  const { variant, label } = variants[status];

  return <Badge variant={variant}>{label}</Badge>;
}
