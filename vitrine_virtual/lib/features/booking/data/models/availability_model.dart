import 'package:equatable/equatable.dart';

import '../../../../core/domain/value_objects/time_slot.dart';
import '../../domain/entities/availability.dart';

/// Modelo de dados para disponibilidade de horários.
///
/// Responsável pela serialização/deserialização JSON do Firestore.
/// Converte para [Availability] entity para uso na camada de domínio.
class AvailabilityModel extends Equatable {
  final String id;
  final String tenantId;
  final int dayOfWeek;
  final String startTime;
  final String endTime;
  final int slotDurationMinutes;

  const AvailabilityModel({
    required this.id,
    required this.tenantId,
    required this.dayOfWeek,
    required this.startTime,
    required this.endTime,
    required this.slotDurationMinutes,
  });

  /// Cria instância a partir de JSON do Firestore.
  factory AvailabilityModel.fromJson(Map<String, dynamic> json, String id) {
    return AvailabilityModel(
      id: id,
      tenantId: (json['tenant_id'] ?? json['tenantId']) as String,
      dayOfWeek: (json['day_of_week'] ?? json['dayOfWeek']) as int,
      startTime: (json['start_time'] ?? json['startTime']) as String,
      endTime: (json['end_time'] ?? json['endTime']) as String,
      slotDurationMinutes:
          (json['slot_duration_minutes'] ?? json['slotDurationMinutes']) as int,
    );
  }

  /// Cria instância a partir de uma [Availability] entity.
  factory AvailabilityModel.fromEntity(Availability entity) {
    return AvailabilityModel(
      id: entity.id,
      tenantId: entity.tenantId,
      dayOfWeek: entity.dayOfWeek,
      startTime: entity.startTime.formatted,
      endTime: entity.endTime.formatted,
      slotDurationMinutes: entity.slotDurationMinutes,
    );
  }

  /// Converte para JSON para persistência.
  Map<String, dynamic> toJson() {
    return {
      'tenant_id': tenantId,
      'day_of_week': dayOfWeek,
      'start_time': startTime,
      'end_time': endTime,
      'slot_duration_minutes': slotDurationMinutes,
    };
  }

  /// Converte para [Availability] entity.
  Availability toEntity() {
    return Availability(
      id: id,
      tenantId: tenantId,
      dayOfWeek: dayOfWeek,
      startTime: TimeSlot(startTime),
      endTime: TimeSlot(endTime),
      slotDurationMinutes: slotDurationMinutes,
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
