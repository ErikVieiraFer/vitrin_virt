import 'package:equatable/equatable.dart';

import '../../../../core/domain/value_objects/hex_color.dart';
import '../../../../core/theme/app_colors.dart';
import '../../domain/entities/theme_settings.dart';

/// Modelo de dados para configurações de tema.
///
/// Responsável pela serialização/deserialização JSON.
/// Converte para [ThemeSettings] entity para uso na camada de domínio.
class ThemeSettingsModel extends Equatable {
  final String primaryColor;
  final String secondaryColor;
  final String? fontFamily;

  const ThemeSettingsModel({
    required this.primaryColor,
    required this.secondaryColor,
    this.fontFamily,
  });

  /// Cria instância a partir de JSON.
  ///
  /// Suporta ambas nomenclaturas: snake_case e camelCase.
  factory ThemeSettingsModel.fromJson(Map<String, dynamic> json) {
    final primaryColor =
        (json['primary_color'] ?? json['primaryColor']) as String?;
    final secondaryColor =
        (json['secondary_color'] ?? json['secondaryColor']) as String?;
    final fontFamily = (json['font_family'] ?? json['fontFamily']) as String?;

    // Se não tiver cores, usa as cores padrão
    if (primaryColor == null || secondaryColor == null) {
      final defaults = ThemeSettingsModel.defaultSettings();
      return ThemeSettingsModel(
        primaryColor: primaryColor ?? defaults.primaryColor,
        secondaryColor: secondaryColor ?? defaults.secondaryColor,
        fontFamily: fontFamily,
      );
    }

    return ThemeSettingsModel(
      primaryColor: primaryColor,
      secondaryColor: secondaryColor,
      fontFamily: fontFamily,
    );
  }

  /// Cria instância a partir de uma [ThemeSettings] entity.
  factory ThemeSettingsModel.fromEntity(ThemeSettings entity) {
    return ThemeSettingsModel(
      primaryColor: entity.primaryColor.value,
      secondaryColor: entity.secondaryColor.value,
      fontFamily: entity.fontFamily,
    );
  }

  /// Converte para JSON para persistência.
  Map<String, dynamic> toJson() {
    return {
      'primary_color': primaryColor,
      'secondary_color': secondaryColor,
      if (fontFamily != null) 'font_family': fontFamily,
    };
  }

  /// Converte para [ThemeSettings] entity.
  ThemeSettings toEntity() {
    return ThemeSettings(
      primaryColor: HexColor(primaryColor),
      secondaryColor: HexColor(secondaryColor),
      fontFamily: fontFamily,
    );
  }

  /// Configurações padrão do tema.
  factory ThemeSettingsModel.defaultSettings() {
    final primaryHex =
        AppColors.defaultPrimary.toARGB32().toRadixString(16).substring(2);
    final secondaryHex =
        AppColors.defaultSecondary.toARGB32().toRadixString(16).substring(2);

    return ThemeSettingsModel(
      primaryColor: '#$primaryHex',
      secondaryColor: '#$secondaryHex',
    );
  }

  @override
  List<Object?> get props => [primaryColor, secondaryColor, fontFamily];
}
