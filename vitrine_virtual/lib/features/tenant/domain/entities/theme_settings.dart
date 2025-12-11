import 'package:equatable/equatable.dart';

import '../../../../core/domain/value_objects/hex_color.dart';

/// Entity para configurações de tema do tenant.
///
/// Define as cores e fonte personalizadas do estabelecimento.
/// Imutável e com validações de negócio.
class ThemeSettings extends Equatable {
  final HexColor primaryColor;
  final HexColor secondaryColor;
  final String? fontFamily;

  const ThemeSettings({
    required this.primaryColor,
    required this.secondaryColor,
    this.fontFamily,
  });

  /// Cria ThemeSettings com cores padrão.
  factory ThemeSettings.defaultTheme() {
    return ThemeSettings(
      primaryColor: HexColor('#6750A4'), // Material 3 primary
      secondaryColor: HexColor('#625B71'), // Material 3 secondary
    );
  }

  /// Verifica se o tema é válido (cores definidas).
  bool get isValid => primaryColor.isOpaque && secondaryColor.isOpaque;

  /// Verifica se usa fonte customizada.
  bool get hasCustomFont => fontFamily != null && fontFamily!.isNotEmpty;

  /// Verifica se é o tema padrão.
  bool get isDefaultTheme {
    final defaultTheme = ThemeSettings.defaultTheme();
    return primaryColor == defaultTheme.primaryColor &&
        secondaryColor == defaultTheme.secondaryColor;
  }

  /// Retorna cor de texto para a cor primária (contraste).
  HexColor get primaryTextColor => primaryColor.contrastColor;

  /// Retorna cor de texto para a cor secundária (contraste).
  HexColor get secondaryTextColor => secondaryColor.contrastColor;

  /// Cria cópia com modificações.
  ThemeSettings copyWith({
    HexColor? primaryColor,
    HexColor? secondaryColor,
    String? fontFamily,
  }) {
    return ThemeSettings(
      primaryColor: primaryColor ?? this.primaryColor,
      secondaryColor: secondaryColor ?? this.secondaryColor,
      fontFamily: fontFamily ?? this.fontFamily,
    );
  }

  @override
  List<Object?> get props => [primaryColor, secondaryColor, fontFamily];
}
