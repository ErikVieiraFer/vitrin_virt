import 'package:equatable/equatable.dart';

import '../../../../core/domain/value_objects/booking_status.dart';
import '../../../../core/domain/value_objects/phone.dart';
import '../../../../core/domain/value_objects/time_slot.dart';

/// Entity para Booking (agendamento).
///
/// Representa um agendamento de serviço.
/// Entity pura sem dependências de Firebase ou JSON.
/// Imutável e com lógica de negócio.
class Booking extends Equatable {
  final String id;
  final String tenantId;
  final String serviceId;
  final String customerName;
  final Phone customerPhone;
  final DateTime bookingDate;
  final TimeSlot bookingTime;
  final BookingStatus status;
  final DateTime createdAt;

  const Booking({
    required this.id,
    required this.tenantId,
    required this.serviceId,
    required this.customerName,
    required this.customerPhone,
    required this.bookingDate,
    required this.bookingTime,
    required this.status,
    required this.createdAt,
  });

  /// Verifica se o agendamento está configurado corretamente.
  bool get isValid {
    return id.isNotEmpty &&
        tenantId.isNotEmpty &&
        serviceId.isNotEmpty &&
        customerName.isNotEmpty &&
        customerPhone.isValid;
  }

  /// Verifica se o agendamento está pendente.
  bool get isPending => status == BookingStatus.pending;

  /// Verifica se o agendamento está confirmado.
  bool get isConfirmed => status == BookingStatus.confirmed;

  /// Verifica se o agendamento foi cancelado.
  bool get isCancelled => status == BookingStatus.cancelled;

  /// Verifica se o agendamento foi concluído.
  bool get isCompleted => status == BookingStatus.completed;

  /// Verifica se o agendamento está ativo (não finalizado).
  bool get isActive => status.isActive;

  /// Verifica se o agendamento já passou.
  bool get isPast {
    final now = DateTime.now();
    final bookingDateTime = bookingTime.toDateTime(bookingDate);
    return bookingDateTime.isBefore(now);
  }

  /// Verifica se o agendamento é hoje.
  bool get isToday {
    final now = DateTime.now();
    return bookingDate.year == now.year &&
        bookingDate.month == now.month &&
        bookingDate.day == now.day;
  }

  /// Verifica se o agendamento é no futuro.
  bool get isFuture {
    final now = DateTime.now();
    final bookingDateTime = bookingTime.toDateTime(bookingDate);
    return bookingDateTime.isAfter(now);
  }

  /// Verifica se pode ser cancelado.
  bool get canBeCancelled => status.canBeCancelled && !isPast;

  /// Verifica se pode ser confirmado.
  bool get canBeConfirmed => status.canBeConfirmed;

  /// Data e hora formatada para exibição.
  String get formattedDateTime {
    final day = bookingDate.day.toString().padLeft(2, '0');
    final month = bookingDate.month.toString().padLeft(2, '0');
    final year = bookingDate.year;
    return '$day/$month/$year às ${bookingTime.formatted}';
  }

  /// Data formatada para exibição.
  String get formattedDate {
    final day = bookingDate.day.toString().padLeft(2, '0');
    final month = bookingDate.month.toString().padLeft(2, '0');
    final year = bookingDate.year;
    return '$day/$month/$year';
  }

  /// Dias restantes até o agendamento.
  int get daysUntil {
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);
    final booking = DateTime(bookingDate.year, bookingDate.month, bookingDate.day);
    return booking.difference(today).inDays;
  }

  /// Cria cópia com modificações.
  Booking copyWith({
    String? id,
    String? tenantId,
    String? serviceId,
    String? customerName,
    Phone? customerPhone,
    DateTime? bookingDate,
    TimeSlot? bookingTime,
    BookingStatus? status,
    DateTime? createdAt,
  }) {
    return Booking(
      id: id ?? this.id,
      tenantId: tenantId ?? this.tenantId,
      serviceId: serviceId ?? this.serviceId,
      customerName: customerName ?? this.customerName,
      customerPhone: customerPhone ?? this.customerPhone,
      bookingDate: bookingDate ?? this.bookingDate,
      bookingTime: bookingTime ?? this.bookingTime,
      status: status ?? this.status,
      createdAt: createdAt ?? this.createdAt,
    );
  }

  /// Confirma o agendamento.
  Booking confirm() {
    if (!canBeConfirmed) return this;
    return copyWith(status: BookingStatus.confirmed);
  }

  /// Cancela o agendamento.
  Booking cancel() {
    if (!canBeCancelled) return this;
    return copyWith(status: BookingStatus.cancelled);
  }

  /// Marca como concluído.
  Booking complete() {
    if (!status.canBeCompleted) return this;
    return copyWith(status: BookingStatus.completed);
  }

  /// Marca como no-show.
  Booking markAsNoShow() {
    if (!status.canBeMarkedAsNoShow) return this;
    return copyWith(status: BookingStatus.noShow);
  }

  @override
  List<Object?> get props => [
        id,
        tenantId,
        serviceId,
        customerName,
        customerPhone,
        bookingDate,
        bookingTime,
        status,
        createdAt,
      ];
}
