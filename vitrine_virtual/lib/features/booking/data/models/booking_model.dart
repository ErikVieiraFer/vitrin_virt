import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:equatable/equatable.dart';

import '../../../../core/domain/value_objects/booking_status.dart';
import '../../../../core/domain/value_objects/phone.dart';
import '../../../../core/domain/value_objects/time_slot.dart';
import '../../domain/entities/booking.dart';

/// Modelo de dados para Booking (agendamento).
///
/// Responsável pela serialização/deserialização JSON do Firestore.
/// Converte para [Booking] entity para uso na camada de domínio.
class BookingModel extends Equatable {
  final String id;
  final String tenantId;
  final String serviceId;
  final String customerName;
  final String customerPhone;
  final DateTime bookingDate;
  final String bookingTime;
  final String status;
  final DateTime createdAt;

  const BookingModel({
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

  /// Cria instância a partir de JSON do Firestore.
  factory BookingModel.fromJson(Map<String, dynamic> json, String id) {
    return BookingModel(
      id: id,
      tenantId: (json['tenant_id'] ?? json['tenantId']) as String,
      serviceId: (json['service_id'] ?? json['serviceId']) as String,
      customerName: (json['customer_name'] ?? json['customerName']) as String,
      customerPhone: (json['customer_phone'] ?? json['customerPhone']) as String,
      bookingDate: (json['booking_date'] as Timestamp).toDate(),
      bookingTime: (json['booking_time'] ?? json['bookingTime']) as String,
      status: json['status'] as String,
      createdAt: (json['created_at'] as Timestamp).toDate(),
    );
  }

  /// Cria instância a partir de uma [Booking] entity.
  factory BookingModel.fromEntity(Booking entity) {
    return BookingModel(
      id: entity.id,
      tenantId: entity.tenantId,
      serviceId: entity.serviceId,
      customerName: entity.customerName,
      customerPhone: entity.customerPhone.value,
      bookingDate: entity.bookingDate,
      bookingTime: entity.bookingTime.formatted,
      status: entity.status.value,
      createdAt: entity.createdAt,
    );
  }

  /// Converte para JSON para persistência.
  Map<String, dynamic> toJson() {
    return {
      'tenant_id': tenantId,
      'service_id': serviceId,
      'customer_name': customerName,
      'customer_phone': customerPhone,
      'booking_date': Timestamp.fromDate(bookingDate),
      'booking_time': bookingTime,
      'status': status,
      'created_at': Timestamp.fromDate(createdAt),
    };
  }

  /// Converte para [Booking] entity.
  Booking toEntity() {
    return Booking(
      id: id,
      tenantId: tenantId,
      serviceId: serviceId,
      customerName: customerName,
      customerPhone: Phone(customerPhone),
      bookingDate: bookingDate,
      bookingTime: TimeSlot(bookingTime),
      status: BookingStatus.fromString(status),
      createdAt: createdAt,
    );
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
