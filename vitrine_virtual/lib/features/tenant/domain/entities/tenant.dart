import 'package:equatable/equatable.dart';

import '../../../../core/domain/value_objects/phone.dart';
import 'theme_settings.dart';
import 'vitrine_section.dart';

/// Entity para Tenant (estabelecimento/negócio).
///
/// Representa os dados de um estabelecimento na plataforma.
/// Entity pura sem dependências de Firebase ou JSON.
/// Imutável e com validações de negócio.
class Tenant extends Equatable {
  final String id;
  final String subdomain;
  final String name;
  final String logoUrl;
  final Phone whatsapp;
  final ThemeSettings themeSettings;
  final List<VitrineSection> sections;

  const Tenant({
    required this.id,
    required this.subdomain,
    required this.name,
    required this.logoUrl,
    required this.whatsapp,
    required this.themeSettings,
    this.sections = const [],
  });

  /// Verifica se o tenant está configurado corretamente.
  bool get isValid {
    return id.isNotEmpty &&
        subdomain.isNotEmpty &&
        name.isNotEmpty &&
        themeSettings.isValid;
  }

  /// Verifica se tem logo configurada.
  bool get hasLogo => logoUrl.isNotEmpty;

  /// Verifica se tem WhatsApp configurado.
  bool get hasWhatsapp => whatsapp.isValid;

  /// Verifica se tem tema personalizado.
  bool get hasCustomTheme => !themeSettings.isDefaultTheme;

  /// Verifica se o subdomain é válido.
  bool get hasValidSubdomain {
    // Subdomain deve ter pelo menos 3 caracteres, apenas letras/números/hífens
    if (subdomain.length < 3) return false;
    return RegExp(r'^[a-z0-9][a-z0-9-]*[a-z0-9]$').hasMatch(subdomain);
  }

  /// URL para contato via WhatsApp.
  String whatsappUrl({String? message}) {
    return whatsapp.whatsappUrl(message: message);
  }

  /// Gera URL da vitrine para este tenant.
  String vitrineUrl({String? baseUrl}) {
    final base = baseUrl ?? 'https://vitrinevirtual.com.br';
    return '$base/$subdomain';
  }

  /// Cria cópia com modificações.
  Tenant copyWith({
    String? id,
    String? subdomain,
    String? name,
    String? logoUrl,
    Phone? whatsapp,
    ThemeSettings? themeSettings,
    List<VitrineSection>? sections,
  }) {
    return Tenant(
      id: id ?? this.id,
      subdomain: subdomain ?? this.subdomain,
      name: name ?? this.name,
      logoUrl: logoUrl ?? this.logoUrl,
      whatsapp: whatsapp ?? this.whatsapp,
      themeSettings: themeSettings ?? this.themeSettings,
      sections: sections ?? this.sections,
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
        sections,
      ];
}
