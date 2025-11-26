'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/use-auth';
import { getAvailabilityByTenantId, createOrUpdateAvailability } from '@/lib/firebase/firestore';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Clock } from 'lucide-react';
import type { WeekAvailability, DayAvailability, DayOfWeek } from '@/types/availability';
import { DEFAULT_WEEK_AVAILABILITY } from '@/types/availability';

const DAYS: { key: DayOfWeek; label: string }[] = [
  { key: 'monday', label: 'Segunda-feira' },
  { key: 'tuesday', label: 'Terça-feira' },
  { key: 'wednesday', label: 'Quarta-feira' },
  { key: 'thursday', label: 'Quinta-feira' },
  { key: 'friday', label: 'Sexta-feira' },
  { key: 'saturday', label: 'Sábado' },
  { key: 'sunday', label: 'Domingo' },
];

const TIME_OPTIONS = Array.from({ length: 48 }, (_, i) => {
  const hours = Math.floor(i / 2);
  const minutes = i % 2 === 0 ? '00' : '30';
  return `${hours.toString().padStart(2, '0')}:${minutes}`;
});

const SLOT_DURATIONS = [15, 30, 45, 60];

export default function AvailabilityPage() {
  const { tenant } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [weekAvailability, setWeekAvailability] = useState<WeekAvailability>(
    DEFAULT_WEEK_AVAILABILITY
  );

  useEffect(() => {
    if (tenant?.id) {
      fetchAvailability();
    }
  }, [tenant?.id]);

  const fetchAvailability = async () => {
    if (!tenant?.id) return;

    try {
      const data = await getAvailabilityByTenantId(tenant.id);
      if (data) {
        setWeekAvailability(data.weekAvailability);
      }
    } catch (err) {
      console.error('Error fetching availability:', err);
      setError('Erro ao carregar disponibilidade');
    } finally {
      setLoading(false);
    }
  };

  const handleDayChange = (day: DayOfWeek, field: keyof DayAvailability, value: any) => {
    setWeekAvailability((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value,
      },
    }));
  };

  const handleTimeChange = (
    day: DayOfWeek,
    timeField: 'start' | 'end',
    value: string
  ) => {
    setWeekAvailability((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        timeSlot: {
          ...prev[day].timeSlot,
          [timeField]: value,
        },
      },
    }));
  };

  const validateTimes = (): boolean => {
    for (const day of DAYS) {
      const dayData = weekAvailability[day.key];
      if (dayData.enabled) {
        if (dayData.timeSlot.start >= dayData.timeSlot.end) {
          setError(`${day.label}: O horário de início deve ser menor que o horário de fim`);
          return false;
        }
      }
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenant?.id) return;

    setError('');
    setSuccess(false);

    if (!validateTimes()) {
      return;
    }

    setSaving(true);

    try {
      await createOrUpdateAvailability(tenant.id, weekAvailability);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving availability:', err);
      setError('Erro ao salvar disponibilidade. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Horários de Disponibilidade</h1>
        <p className="text-muted-foreground">
          Configure os horários em que você aceita agendamentos
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Configuração Semanal</CardTitle>
            <CardDescription>
              Defina os horários de funcionamento para cada dia da semana
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {DAYS.map((day) => {
              const dayData = weekAvailability[day.key];
              return (
                <div key={day.key} className="p-4 border rounded-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id={`${day.key}-enabled`}
                        checked={dayData.enabled}
                        onChange={(e) =>
                          handleDayChange(day.key, 'enabled', e.target.checked)
                        }
                        disabled={saving}
                      />
                      <Label
                        htmlFor={`${day.key}-enabled`}
                        className="text-base font-medium cursor-pointer"
                      >
                        {day.label}
                      </Label>
                    </div>
                    {dayData.enabled && (
                      <Clock className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>

                  {dayData.enabled && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 ml-7">
                      <div className="space-y-2">
                        <Label htmlFor={`${day.key}-start`}>Início</Label>
                        <Select
                          id={`${day.key}-start`}
                          value={dayData.timeSlot.start}
                          onChange={(e) =>
                            handleTimeChange(day.key, 'start', e.target.value)
                          }
                          disabled={saving}
                        >
                          {TIME_OPTIONS.map((time) => (
                            <option key={time} value={time}>
                              {time}
                            </option>
                          ))}
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`${day.key}-end`}>Fim</Label>
                        <Select
                          id={`${day.key}-end`}
                          value={dayData.timeSlot.end}
                          onChange={(e) =>
                            handleTimeChange(day.key, 'end', e.target.value)
                          }
                          disabled={saving}
                        >
                          {TIME_OPTIONS.map((time) => (
                            <option key={time} value={time}>
                              {time}
                            </option>
                          ))}
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`${day.key}-duration`}>
                          Duração do Slot (min)
                        </Label>
                        <Select
                          id={`${day.key}-duration`}
                          value={dayData.slotDuration}
                          onChange={(e) =>
                            handleDayChange(
                              day.key,
                              'slotDuration',
                              Number(e.target.value)
                            )
                          }
                          disabled={saving}
                        >
                          {SLOT_DURATIONS.map((duration) => (
                            <option key={duration} value={duration}>
                              {duration} min
                            </option>
                          ))}
                        </Select>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {error && (
              <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                {error}
              </div>
            )}

            {success && (
              <div className="text-sm text-green-600 bg-green-50 p-3 rounded-md">
                Horários salvos com sucesso!
              </div>
            )}

            <Button type="submit" disabled={saving} className="w-full">
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Salvando...
                </>
              ) : (
                'Salvar Horários'
              )}
            </Button>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
