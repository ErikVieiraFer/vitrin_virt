import 'package:equatable/equatable.dart';

/// Value Object para horário no formato HH:MM.
///
/// Valida e manipula horários de forma segura.
class TimeSlot extends Equatable {
  final int _hours;
  final int _minutes;

  const TimeSlot._(this._hours, this._minutes);

  /// Cria TimeSlot a partir de string "HH:MM".
  factory TimeSlot(String value) {
    final parts = value.split(':');
    if (parts.length != 2) {
      return const TimeSlot._(0, 0);
    }

    final hours = int.tryParse(parts[0]) ?? 0;
    final minutes = int.tryParse(parts[1]) ?? 0;

    return TimeSlot._(
      hours.clamp(0, 23),
      minutes.clamp(0, 59),
    );
  }

  /// Cria TimeSlot a partir de horas e minutos.
  factory TimeSlot.fromParts(int hours, int minutes) {
    return TimeSlot._(
      hours.clamp(0, 23),
      minutes.clamp(0, 59),
    );
  }

  /// Cria TimeSlot a partir de DateTime.
  factory TimeSlot.fromDateTime(DateTime dateTime) {
    return TimeSlot._(dateTime.hour, dateTime.minute);
  }

  /// Cria TimeSlot a partir de minutos totais desde meia-noite.
  factory TimeSlot.fromTotalMinutes(int totalMinutes) {
    final clamped = totalMinutes.clamp(0, 24 * 60 - 1);
    return TimeSlot._(clamped ~/ 60, clamped % 60);
  }

  /// Cria TimeSlot para meia-noite.
  factory TimeSlot.midnight() => const TimeSlot._(0, 0);

  /// Cria TimeSlot para meio-dia.
  factory TimeSlot.noon() => const TimeSlot._(12, 0);

  /// Cria TimeSlot para agora.
  factory TimeSlot.now() {
    final now = DateTime.now();
    return TimeSlot._(now.hour, now.minute);
  }

  /// Horas (0-23).
  int get hours => _hours;

  /// Minutos (0-59).
  int get minutes => _minutes;

  /// Total de minutos desde meia-noite.
  int get totalMinutes => _hours * 60 + _minutes;

  /// Verifica se é de manhã (antes de 12:00).
  bool get isMorning => _hours < 12;

  /// Verifica se é de tarde (12:00 - 18:00).
  bool get isAfternoon => _hours >= 12 && _hours < 18;

  /// Verifica se é de noite (18:00 ou depois).
  bool get isEvening => _hours >= 18;

  /// Formata como "HH:MM".
  String get formatted {
    return '${_hours.toString().padLeft(2, '0')}:${_minutes.toString().padLeft(2, '0')}';
  }

  /// Formata como "Hh MMmin" (ex: "9h 30min", "14h").
  String get formattedLong {
    if (_minutes == 0) {
      return '${_hours}h';
    }
    return '${_hours}h ${_minutes}min';
  }

  /// Formata com período (AM/PM).
  String get formattedWithPeriod {
    final period = _hours < 12 ? 'AM' : 'PM';
    final hour12 = _hours == 0 ? 12 : (_hours > 12 ? _hours - 12 : _hours);
    return '${hour12.toString().padLeft(2, '0')}:${_minutes.toString().padLeft(2, '0')} $period';
  }

  /// Adiciona minutos ao horário.
  TimeSlot addMinutes(int minutes) {
    final newTotal = (totalMinutes + minutes).clamp(0, 24 * 60 - 1);
    return TimeSlot.fromTotalMinutes(newTotal);
  }

  /// Subtrai minutos do horário.
  TimeSlot subtractMinutes(int minutes) => addMinutes(-minutes);

  /// Diferença em minutos entre dois horários.
  int differenceInMinutes(TimeSlot other) {
    return totalMinutes - other.totalMinutes;
  }

  /// Verifica se está entre dois horários.
  bool isBetween(TimeSlot start, TimeSlot end) {
    return totalMinutes >= start.totalMinutes && totalMinutes <= end.totalMinutes;
  }

  /// Converte para DateTime em uma data específica.
  DateTime toDateTime(DateTime date) {
    return DateTime(date.year, date.month, date.day, _hours, _minutes);
  }

  /// Comparações.
  bool operator <(TimeSlot other) => totalMinutes < other.totalMinutes;
  bool operator <=(TimeSlot other) => totalMinutes <= other.totalMinutes;
  bool operator >(TimeSlot other) => totalMinutes > other.totalMinutes;
  bool operator >=(TimeSlot other) => totalMinutes >= other.totalMinutes;

  @override
  String toString() => formatted;

  @override
  List<Object?> get props => [_hours, _minutes];
}
