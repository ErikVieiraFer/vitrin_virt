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
    return TenantModel(
      id: id,
      subdomain: json['subdomain'] as String,
      name: json['name'] as String,
      logoUrl: json['logo_url'] as String,
      whatsapp: json['whatsapp'] as String,
      themeSettings: ThemeSettingsModel.fromJson(
        json['theme_settings'] as Map<String, dynamic>,
      ),
    );
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
