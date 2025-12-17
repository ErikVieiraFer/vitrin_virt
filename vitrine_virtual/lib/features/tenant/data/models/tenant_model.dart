import 'package:equatable/equatable.dart';

import '../../../../core/domain/value_objects/phone.dart';
import '../../../../core/utils/app_logger.dart';
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
    AppLogger.debug(
      'Parsing TenantModel - ID: $id, Data: $json',
      tag: 'TenantModel',
    );

    try {
      final subdomain = json['subdomain'] as String?;
      final name = json['name'] as String?;
      final logoUrl = (json['logo_url'] ?? json['logoUrl']) as String?;
      final whatsapp = json['whatsapp'] as String?;
      final themeSettingsData = json['theme_settings'] ?? json['themeSettings'];

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
      AppLogger.error(
        'Erro ao fazer parse do TenantModel',
        tag: 'TenantModel',
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
