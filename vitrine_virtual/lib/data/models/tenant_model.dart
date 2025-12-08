import 'dart:developer' as developer;

import 'package:equatable/equatable.dart';
import 'theme_settings_model.dart';

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

  factory TenantModel.fromJson(Map<String, dynamic> json, String id) {
    developer.log('=== TenantModel.fromJson INICIADO ===', name: 'TenantModel');
    developer.log('JSON recebido: $json', name: 'TenantModel');
    developer.log('ID: $id', name: 'TenantModel');

    try {
      // Verificar cada campo individualmente
      final subdomain = json['subdomain'] as String?;
      developer.log('subdomain: $subdomain', name: 'TenantModel');

      final name = json['name'] as String?;
      developer.log('name: $name', name: 'TenantModel');

      // Tentar logo_url primeiro, depois logoUrl
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
            ? ThemeSettingsModel.fromJson(themeSettingsData as Map<String, dynamic>)
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

  Map<String, dynamic> toJson() {
    return {
      'subdomain': subdomain,
      'name': name,
      'logo_url': logoUrl,
      'whatsapp': whatsapp,
      'theme_settings': themeSettings.toJson(),
    };
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
