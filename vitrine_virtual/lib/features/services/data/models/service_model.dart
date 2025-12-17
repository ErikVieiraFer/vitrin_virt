import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:equatable/equatable.dart';

import '../../../../core/domain/value_objects/money.dart';
import '../../../../core/utils/app_logger.dart';
import '../../domain/entities/service.dart';

/// Modelo de dados para Service (serviço oferecido).
///
/// Responsável pela serialização/deserialização JSON do Firestore.
/// Converte para [Service] entity para uso na camada de domínio.
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

  /// Cria instância a partir de JSON do Firestore.
  ///
  /// Suporta ambas nomenclaturas: snake_case e camelCase.
  factory ServiceModel.fromJson(Map<String, dynamic> json, String id) {
    AppLogger.debug(
      'Parsing ServiceModel - ID: $id, Data: $json',
      tag: 'ServiceModel',
    );

    try {
      final tenantId = (json['tenant_id'] ?? json['tenantId']) as String?;
      final name = json['name'] as String?;
      final description = json['description'] as String?;
      final durationMinutes = (json['duration_minutes'] ??
          json['durationMinutes'] ??
          json['duration']) as int?;

      final priceRaw = json['price'];
      final price = priceRaw is num ? priceRaw.toDouble() : 0.0;

      final imageUrl =
          (json['image_url'] ?? json['imageUrl'] ?? json['image']) as String?;

      final isActive =
          (json['is_active'] ?? json['isActive'] ?? json['active']) as bool? ??
              true;

      final createdAtRaw = json['created_at'] ?? json['createdAt'];
      DateTime createdAt;
      if (createdAtRaw is Timestamp) {
        createdAt = createdAtRaw.toDate();
      } else {
        createdAt = DateTime.now();
      }

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
      AppLogger.error(
        'Erro ao fazer parse do ServiceModel',
        tag: 'ServiceModel',
        error: e,
        stackTrace: stackTrace,
      );
      rethrow;
    }
  }

  /// Cria instância a partir de uma [Service] entity.
  factory ServiceModel.fromEntity(Service entity) {
    return ServiceModel(
      id: entity.id,
      tenantId: entity.tenantId,
      name: entity.name,
      description: entity.description,
      durationMinutes: entity.durationMinutes,
      price: entity.price.inReais,
      imageUrl: entity.imageUrl,
      isActive: entity.isActive,
      createdAt: entity.createdAt,
    );
  }

  /// Converte para JSON para persistência.
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

  /// Converte para [Service] entity.
  Service toEntity() {
    return Service(
      id: id,
      tenantId: tenantId,
      name: name,
      description: description,
      durationMinutes: durationMinutes,
      price: Money.fromReais(price),
      imageUrl: imageUrl,
      isActive: isActive,
      createdAt: createdAt,
    );
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
