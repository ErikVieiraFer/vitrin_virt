import 'package:equatable/equatable.dart';
import 'package:cloud_firestore/cloud_firestore.dart';

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

  factory BookingModel.fromJson(Map<String, dynamic> json, String id) {
    return BookingModel(
      id: id,
      tenantId: json['tenant_id'] as String,
      serviceId: json['service_id'] as String,
      customerName: json['customer_name'] as String,
      customerPhone: json['customer_phone'] as String,
      bookingDate: (json['booking_date'] as Timestamp).toDate(),
      bookingTime: json['booking_time'] as String,
      status: json['status'] as String,
      createdAt: (json['created_at'] as Timestamp).toDate(),
    );
  }

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

  bool get isPending => status == 'pending';
  bool get isConfirmed => status == 'confirmed';
  bool get isCancelled => status == 'cancelled';

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
