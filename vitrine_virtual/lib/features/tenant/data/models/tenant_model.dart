import 'dart:developer' as developer;

import 'package:equatable/equatable.dart';

import '../../../../core/domain/value_objects/phone.dart';
import '../../domain/entities/tenant.dart';
import 'theme_settings_model.dart';

/// Modelo de dados para Tenant.
///
/// Responsável pela serialização/deserialização JSON do Firestore.
/// Converte para [Tenant] entity para uso na camada de domínio.
class TenantModel extends Equatable {
  final String id;
  final String subdomain;
  final String name;
  final String logoUrl;
  final String whatsapp;
  final ThemeSettingsModel themeSettings;

  const TenantModel({
    required this.id,
    required this.subdomain,
    required this.name,
    required this.logoUrl,
    required this.whatsapp,
    required this.themeSettings,
  });

  /// Cria uma instância a partir de JSON do Firestore.
  ///
  /// Suporta ambas nomenclaturas: snake_case e camelCase.
  factory TenantModel.fromJson(Map<String, dynamic> json, String id) {
    developer.log('=== TenantModel.fromJson INICIADO ===', name: 'TenantModel');
    developer.log('JSON recebido: $json', name: 'TenantModel');
    developer.log('ID: $id', name: 'TenantModel');

    try {
      final subdomain = json['subdomain'] as String?;
      developer.log('subdomain: $subdomain', name: 'TenantModel');

      final name = json['name'] as String?;
      developer.log('name: $name', name: 'TenantModel');

      // Suporta logo_url e logoUrl
      final logoUrl = (json['logo_url'] ?? json['logoUrl']) as String?;
      developer.log('logoUrl: $logoUrl', name: 'TenantModel');

      final whatsapp = json['whatsapp'] as String?;
      developer.log('whatsapp: $whatsapp', name: 'TenantModel');

      final themeSettingsData = json['theme_settings'] ?? json['themeSettings'];
      developer.log('themeSettings: $themeSettingsData', name: 'TenantModel');

      return TenantModel(
        id: id,
        subdomain: subdomain ?? '',
        name: name ?? 'Sem nome',
        logoUrl: logoUrl ?? '',
        whatsapp: whatsapp ?? '',
        themeSettings: themeSettingsData != null
            ? ThemeSettingsModel.fromJson(
                themeSettingsData as Map<String, dynamic>)
            : ThemeSettingsModel.defaultSettings(),
      );
    } catch (e, stackTrace) {
      developer.log(
        'ERRO ao fazer parse do TenantModel: $e',
        name: 'TenantModel',
        level: 1000,
        error: e,
        stackTrace: stackTrace,
      );
      rethrow;
    }
  }

  /// Cria instância a partir de uma [Tenant] entity.
  factory TenantModel.fromEntity(Tenant entity) {
    return TenantModel(
      id: entity.id,
      subdomain: entity.subdomain,
      name: entity.name,
      logoUrl: entity.logoUrl,
      whatsapp: entity.whatsapp.value,
      themeSettings: ThemeSettingsModel.fromEntity(entity.themeSettings),
    );
  }

  /// Converte para JSON para persistência.
  Map<String, dynamic> toJson() {
    return {
      'subdomain': subdomain,
      'name': name,
      'logo_url': logoUrl,
      'whatsapp': whatsapp,
      'theme_settings': themeSettings.toJson(),
    };
  }

  /// Converte para [Tenant] entity.
  Tenant toEntity() {
    return Tenant(
      id: id,
      subdomain: subdomain,
      name: name,
      logoUrl: logoUrl,
      whatsapp: Phone(whatsapp),
      themeSettings: themeSettings.toEntity(),
    );
  }

  @override
  List<Object?> get props => [
        id,
        subdomain,
        name,
        logoUrl,
        whatsapp,
        themeSettings,
      ];
}
