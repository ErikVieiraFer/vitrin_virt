import 'dart:developer' as developer;

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
    developer.log('=== ServiceModel.fromJson INICIADO ===', name: 'ServiceModel');
    developer.log('JSON recebido: $json', name: 'ServiceModel');
    developer.log('ID: $id', name: 'ServiceModel');

    try {
      // Suporta ambas nomenclaturas: snake_case e camelCase
      final tenantId = (json['tenant_id'] ?? json['tenantId']) as String?;
      developer.log('tenantId: $tenantId', name: 'ServiceModel');

      final name = json['name'] as String?;
      developer.log('name: $name', name: 'ServiceModel');

      final description = json['description'] as String?;
      developer.log('description: $description', name: 'ServiceModel');

      final durationMinutes = (json['duration_minutes'] ?? json['durationMinutes'] ?? json['duration']) as int?;
      developer.log('durationMinutes: $durationMinutes', name: 'ServiceModel');

      final priceRaw = json['price'];
      final price = priceRaw is num ? priceRaw.toDouble() : 0.0;
      developer.log('price: $price', name: 'ServiceModel');

      final imageUrl = (json['image_url'] ?? json['imageUrl'] ?? json['image']) as String?;
      developer.log('imageUrl: $imageUrl', name: 'ServiceModel');

      final isActive = (json['is_active'] ?? json['isActive'] ?? json['active']) as bool? ?? true;
      developer.log('isActive: $isActive', name: 'ServiceModel');

      // createdAt pode ser Timestamp ou null
      final createdAtRaw = json['created_at'] ?? json['createdAt'];
      DateTime createdAt;
      if (createdAtRaw is Timestamp) {
        createdAt = createdAtRaw.toDate();
      } else {
        createdAt = DateTime.now();
      }
      developer.log('createdAt: $createdAt', name: 'ServiceModel');

      return ServiceModel(
        id: id,
        tenantId: tenantId ?? '',
        name: name ?? 'Sem nome',
        description: description ?? '',
        durationMinutes: durationMinutes ?? 30,
        price: price,
        imageUrl: imageUrl ?? '',
        isActive: isActive,
        createdAt: createdAt,
      );
    } catch (e, stackTrace) {
      developer.log(
        'ERRO ao fazer parse do ServiceModel: $e',
        name: 'ServiceModel',
        level: 1000,
        error: e,
        stackTrace: stackTrace,
      );
      rethrow;
    }
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
