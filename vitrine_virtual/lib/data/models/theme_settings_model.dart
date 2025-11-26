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
    return ThemeSettingsModel(
      primaryColor: json['primary_color'] as String,
      secondaryColor: json['secondary_color'] as String,
      fontFamily: json['font_family'] as String?,
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
