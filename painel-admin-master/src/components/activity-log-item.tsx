import { ActivityLog, ActivityType } from '@/types/activity-log';
import { formatDateTime } from '@/lib/utils';
import {
  UserPlus,
  Edit,
  UserX,
  UserCheck,
  Palette,
  Plus,
  Trash2,
  Calendar,
  ExternalLink,
} from 'lucide-react';

interface ActivityLogItemProps {
  log: ActivityLog;
}

const iconMap: Record<ActivityType, any> = {
  tenant_created: UserPlus,
  tenant_updated: Edit,
  tenant_deactivated: UserX,
  tenant_activated: UserCheck,
  theme_updated: Palette,
  service_created: Plus,
  service_updated: Edit,
  service_deleted: Trash2,
  booking_created: Calendar,
  booking_updated: Edit,
  booking_cancelled: UserX,
  admin_impersonate: ExternalLink,
};

const colorMap: Record<ActivityType, string> = {
  tenant_created: 'bg-green-100 text-green-600',
  tenant_updated: 'bg-blue-100 text-blue-600',
  tenant_deactivated: 'bg-red-100 text-red-600',
  tenant_activated: 'bg-green-100 text-green-600',
  theme_updated: 'bg-purple-100 text-purple-600',
  service_created: 'bg-green-100 text-green-600',
  service_updated: 'bg-blue-100 text-blue-600',
  service_deleted: 'bg-red-100 text-red-600',
  booking_created: 'bg-green-100 text-green-600',
  booking_updated: 'bg-blue-100 text-blue-600',
  booking_cancelled: 'bg-red-100 text-red-600',
  admin_impersonate: 'bg-yellow-100 text-yellow-600',
};

export function ActivityLogItem({ log }: ActivityLogItemProps) {
  const Icon = iconMap[log.type];
  const colorClass = colorMap[log.type];

  return (
    <div className="flex gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
      <div className={`p-2 rounded-full h-fit ${colorClass}`}>
        <Icon className="h-5 w-5" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-medium">{log.description}</p>

        {log.tenant_name && (
          <p className="text-sm text-muted-foreground mt-1">
            Cliente: {log.tenant_name}
          </p>
        )}

        <p className="text-xs text-muted-foreground mt-2">
          {formatDateTime(log.created_at.toDate())}
        </p>
      </div>
    </div>
  );
}
