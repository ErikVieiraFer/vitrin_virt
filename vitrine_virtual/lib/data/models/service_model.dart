import 'package:equatable/equatable.dart';
import 'package:cloud_firestore/cloud_firestore.dart';

class ServiceModel extends Equatable {
  final String id;
  final String tenantId;
  final String name;
  final String description;
  final int durationMinutes;
  final double price;
  final String imageUrl;
  final bool isActive;
  final DateTime createdAt;

  const ServiceModel({
    required this.id,
    required this.tenantId,
    required this.name,
    required this.description,
    required this.durationMinutes,
    required this.price,
    required this.imageUrl,
    required this.isActive,
    required this.createdAt,
  });

  factory ServiceModel.fromJson(Map<String, dynamic> json, String id) {
    return ServiceModel(
      id: id,
      tenantId: json['tenant_id'] as String,
      name: json['name'] as String,
      description: json['description'] as String,
      durationMinutes: json['duration_minutes'] as int,
      price: (json['price'] as num).toDouble(),
      imageUrl: json['image_url'] as String,
      isActive: json['is_active'] as bool? ?? true,
      createdAt: (json['created_at'] as Timestamp).toDate(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'tenant_id': tenantId,
      'name': name,
      'description': description,
      'duration_minutes': durationMinutes,
      'price': price,
      'image_url': imageUrl,
      'is_active': isActive,
      'created_at': Timestamp.fromDate(createdAt),
    };
  }

  String get formattedPrice {
    return 'R\$ ${price.toStringAsFixed(2).replaceAll('.', ',')}';
  }

  String get formattedDuration {
    if (durationMinutes < 60) {
      return '$durationMinutes min';
    }
    final hours = durationMinutes ~/ 60;
    final minutes = durationMinutes % 60;
    if (minutes == 0) {
      return '${hours}h';
    }
    return '${hours}h ${minutes}min';
  }

  @override
  List<Object?> get props => [
        id,
        tenantId,
        name,
        description,
        durationMinutes,
        price,
        imageUrl,
        isActive,
        createdAt,
      ];
}
