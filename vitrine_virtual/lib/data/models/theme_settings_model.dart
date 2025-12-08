import 'package:equatable/equatable.dart';
import '../../core/theme/app_colors.dart';

class ThemeSettingsModel extends Equatable {
  final String primaryColor;
  final String secondaryColor;
  final String? fontFamily;

  const ThemeSettingsModel({
    required this.primaryColor,
    required this.secondaryColor,
    this.fontFamily,
  });

  factory ThemeSettingsModel.fromJson(Map<String, dynamic> json) {
    // Suporta ambas nomenclaturas: snake_case e camelCase
    final primaryColor = (json['primary_color'] ?? json['primaryColor']) as String?;
    final secondaryColor = (json['secondary_color'] ?? json['secondaryColor']) as String?;
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

  Map<String, dynamic> toJson() {
    return {
      'primary_color': primaryColor,
      'secondary_color': secondaryColor,
      if (fontFamily != null) 'font_family': fontFamily,
    };
  }

  factory ThemeSettingsModel.defaultSettings() {
    final primaryHex = AppColors.defaultPrimary.toARGB32().toRadixString(16).substring(2);
    final secondaryHex = AppColors.defaultSecondary.toARGB32().toRadixString(16).substring(2);

    return ThemeSettingsModel(
      primaryColor: '#$primaryHex',
      secondaryColor: '#$secondaryHex',
    );
  }

  @override
  List<Object?> get props => [primaryColor, secondaryColor, fontFamily];
}
