import 'package:equatable/equatable.dart';
import 'package:flutter/material.dart';

/// Value Object para cor hexadecimal.
///
/// Valida e converte cores em formato hexadecimal (#RRGGBB ou #AARRGGBB).
class HexColor extends Equatable {
  final String _value;

  const HexColor._(this._value);

  /// Cria HexColor a partir de uma string hexadecimal.
  /// Aceita formatos: #RGB, #RRGGBB, #AARRGGBB, RGB, RRGGBB, AARRGGBB.
  factory HexColor(String value) {
    var hex = value.trim();

    // Remove # se presente
    if (hex.startsWith('#')) {
      hex = hex.substring(1);
    }

    // Expande formato curto (#RGB -> #RRGGBB)
    if (hex.length == 3) {
      hex = hex.split('').map((c) => '$c$c').join();
    }

    // Valida e normaliza
    if (hex.length == 6) {
      hex = 'FF$hex'; // Adiciona alpha opaco
    }

    // Valida formato final (deve ter 8 caracteres hexadecimais)
    if (hex.length != 8 || !RegExp(r'^[0-9A-Fa-f]{8}$').hasMatch(hex)) {
      // Retorna preto como fallback
      hex = 'FF000000';
    }

    return HexColor._('#${hex.toUpperCase()}');
  }

  /// Cria HexColor a partir de um Color do Flutter.
  factory HexColor.fromColor(Color color) {
    final hex = color.toARGB32().toRadixString(16).padLeft(8, '0').toUpperCase();
    return HexColor._('#$hex');
  }

  /// Cria HexColor preto.
  factory HexColor.black() => const HexColor._('#FF000000');

  /// Cria HexColor branco.
  factory HexColor.white() => const HexColor._('#FFFFFFFF');

  /// Cria HexColor transparente.
  factory HexColor.transparent() => const HexColor._('#00000000');

  /// Valor hexadecimal com # (ex: #FFRRGGBB).
  String get value => _value;

  /// Valor hexadecimal sem # (ex: FFRRGGBB).
  String get valueWithoutHash => _value.substring(1);

  /// Valor hexadecimal apenas RGB sem alpha (ex: RRGGBB).
  String get rgbValue => _value.substring(3);

  /// Verifica se é válido (sempre verdadeiro após construção).
  bool get isValid => true;

  /// Verifica se é opaco (alpha = FF).
  bool get isOpaque => _value.substring(1, 3) == 'FF';

  /// Verifica se é transparente (alpha = 00).
  bool get isTransparent => _value.substring(1, 3) == '00';

  /// Componente alpha (0-255).
  int get alpha => int.parse(_value.substring(1, 3), radix: 16);

  /// Componente red (0-255).
  int get red => int.parse(_value.substring(3, 5), radix: 16);

  /// Componente green (0-255).
  int get green => int.parse(_value.substring(5, 7), radix: 16);

  /// Componente blue (0-255).
  int get blue => int.parse(_value.substring(7, 9), radix: 16);

  /// Converte para Color do Flutter.
  Color toColor() {
    return Color(int.parse(valueWithoutHash, radix: 16));
  }

  /// Retorna uma versão com alpha modificado.
  HexColor withAlpha(int alpha) {
    final alphaHex = alpha.clamp(0, 255).toRadixString(16).padLeft(2, '0');
    return HexColor._('#$alphaHex$rgbValue');
  }

  /// Retorna uma versão mais clara.
  HexColor lighten([double amount = 0.1]) {
    final color = toColor();
    final hsl = HSLColor.fromColor(color);
    final lightened = hsl.withLightness(
      (hsl.lightness + amount).clamp(0.0, 1.0),
    );
    return HexColor.fromColor(lightened.toColor());
  }

  /// Retorna uma versão mais escura.
  HexColor darken([double amount = 0.1]) {
    final color = toColor();
    final hsl = HSLColor.fromColor(color);
    final darkened = hsl.withLightness(
      (hsl.lightness - amount).clamp(0.0, 1.0),
    );
    return HexColor.fromColor(darkened.toColor());
  }

  /// Verifica se a cor é clara (para determinar cor de texto).
  bool get isLight {
    // Fórmula de luminância relativa
    final luminance = (0.299 * red + 0.587 * green + 0.114 * blue) / 255;
    return luminance > 0.5;
  }

  /// Retorna cor de contraste (branco ou preto).
  HexColor get contrastColor => isLight ? HexColor.black() : HexColor.white();

  @override
  String toString() => _value;

  @override
  List<Object?> get props => [_value];
}
