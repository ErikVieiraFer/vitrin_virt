import 'package:equatable/equatable.dart';

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

  factory AvailabilityModel.fromJson(Map<String, dynamic> json, String id) {
    return AvailabilityModel(
      id: id,
      tenantId: json['tenant_id'] as String,
      dayOfWeek: json['day_of_week'] as int,
      startTime: json['start_time'] as String,
      endTime: json['end_time'] as String,
      slotDurationMinutes: json['slot_duration_minutes'] as int,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'tenant_id': tenantId,
      'day_of_week': dayOfWeek,
      'start_time': startTime,
      'end_time': endTime,
      'slot_duration_minutes': slotDurationMinutes,
    };
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
