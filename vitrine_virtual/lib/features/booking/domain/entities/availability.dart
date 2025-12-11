import 'package:equatable/equatable.dart';

import '../../../../core/domain/value_objects/time_slot.dart';

/// Entity para Availability (disponibilidade de horários).
///
/// Representa a configuração de disponibilidade de um dia da semana.
/// Entity pura sem dependências de Firebase ou JSON.
/// Imutável e com lógica de negócio.
class Availability extends Equatable {
  final String id;
  final String tenantId;
  final int dayOfWeek; // 1 = Segunda, 7 = Domingo
  final TimeSlot startTime;
  final TimeSlot endTime;
  final int slotDurationMinutes;

  const Availability({
    required this.id,
    required this.tenantId,
    required this.dayOfWeek,
    required this.startTime,
    required this.endTime,
    required this.slotDurationMinutes,
  });

  /// Verifica se a disponibilidade está configurada corretamente.
  bool get isValid {
    return id.isNotEmpty &&
        tenantId.isNotEmpty &&
        dayOfWeek >= 1 &&
        dayOfWeek <= 7 &&
        slotDurationMinutes > 0 &&
        startTime < endTime;
  }

  /// Retorna o nome do dia da semana em português.
  String get dayName {
    const days = {
      1: 'Segunda-feira',
      2: 'Terça-feira',
      3: 'Quarta-feira',
      4: 'Quinta-feira',
      5: 'Sexta-feira',
      6: 'Sábado',
      7: 'Domingo',
    };
    return days[dayOfWeek] ?? 'Dia inválido';
  }

  /// Retorna o nome curto do dia da semana.
  String get shortDayName {
    const days = {
      1: 'Seg',
      2: 'Ter',
      3: 'Qua',
      4: 'Qui',
      5: 'Sex',
      6: 'Sáb',
      7: 'Dom',
    };
    return days[dayOfWeek] ?? '???';
  }

  /// Duração total do período de trabalho em minutos.
  int get totalMinutes {
    return endTime.totalMinutes - startTime.totalMinutes;
  }

  /// Número máximo de slots possíveis no dia.
  int get maxSlots {
    if (slotDurationMinutes <= 0) return 0;
    return totalMinutes ~/ slotDurationMinutes;
  }

  /// Gera lista de todos os horários disponíveis.
  List<TimeSlot> generateSlots() {
    if (!isValid) return [];

    final slots = <TimeSlot>[];
    var current = startTime;

    while (current.addMinutes(slotDurationMinutes) <= endTime) {
      slots.add(current);
      current = current.addMinutes(slotDurationMinutes);
    }

    return slots;
  }

  /// Verifica se um horário está dentro do período.
  bool containsTime(TimeSlot time) {
    return time >= startTime && time < endTime;
  }

  /// Verifica se é dia útil (segunda a sexta).
  bool get isWeekday => dayOfWeek >= 1 && dayOfWeek <= 5;

  /// Verifica se é fim de semana.
  bool get isWeekend => dayOfWeek == 6 || dayOfWeek == 7;

  /// Horário formatado: "08:00 - 18:00".
  String get formattedHours {
    return '${startTime.formatted} - ${endTime.formatted}';
  }

  /// Cria cópia com modificações.
  Availability copyWith({
    String? id,
    String? tenantId,
    int? dayOfWeek,
    TimeSlot? startTime,
    TimeSlot? endTime,
    int? slotDurationMinutes,
  }) {
    return Availability(
      id: id ?? this.id,
      tenantId: tenantId ?? this.tenantId,
      dayOfWeek: dayOfWeek ?? this.dayOfWeek,
      startTime: startTime ?? this.startTime,
      endTime: endTime ?? this.endTime,
      slotDurationMinutes: slotDurationMinutes ?? this.slotDurationMinutes,
    );
  }

  @override
  List<Object?> get props => [
        id,
        tenantId,
        dayOfWeek,
        startTime,
        endTime,
        slotDurationMinutes,
      ];
}
