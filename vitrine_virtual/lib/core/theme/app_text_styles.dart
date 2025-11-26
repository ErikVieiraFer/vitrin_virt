import 'package:flutter/material.dart';

class AppTextStyles {
  static const String defaultFontFamily = 'Roboto';

  static TextStyle displayLarge(String? fontFamily) => TextStyle(
        fontFamily: fontFamily ?? defaultFontFamily,
        fontSize: 32,
        fontWeight: FontWeight.bold,
        letterSpacing: -0.5,
      );

  static TextStyle displayMedium(String? fontFamily) => TextStyle(
        fontFamily: fontFamily ?? defaultFontFamily,
        fontSize: 28,
        fontWeight: FontWeight.bold,
        letterSpacing: -0.5,
      );

  static TextStyle displaySmall(String? fontFamily) => TextStyle(
        fontFamily: fontFamily ?? defaultFontFamily,
        fontSize: 24,
        fontWeight: FontWeight.bold,
      );

  static TextStyle headlineLarge(String? fontFamily) => TextStyle(
        fontFamily: fontFamily ?? defaultFontFamily,
        fontSize: 22,
        fontWeight: FontWeight.w600,
      );

  static TextStyle headlineMedium(String? fontFamily) => TextStyle(
        fontFamily: fontFamily ?? defaultFontFamily,
        fontSize: 20,
        fontWeight: FontWeight.w600,
      );

  static TextStyle headlineSmall(String? fontFamily) => TextStyle(
        fontFamily: fontFamily ?? defaultFontFamily,
        fontSize: 18,
        fontWeight: FontWeight.w600,
      );

  static TextStyle bodyLarge(String? fontFamily) => TextStyle(
        fontFamily: fontFamily ?? defaultFontFamily,
        fontSize: 16,
        fontWeight: FontWeight.normal,
      );

  static TextStyle bodyMedium(String? fontFamily) => TextStyle(
        fontFamily: fontFamily ?? defaultFontFamily,
        fontSize: 14,
        fontWeight: FontWeight.normal,
      );

  static TextStyle bodySmall(String? fontFamily) => TextStyle(
        fontFamily: fontFamily ?? defaultFontFamily,
        fontSize: 12,
        fontWeight: FontWeight.normal,
      );

  static TextStyle labelLarge(String? fontFamily) => TextStyle(
        fontFamily: fontFamily ?? defaultFontFamily,
        fontSize: 14,
        fontWeight: FontWeight.w500,
        letterSpacing: 0.5,
      );

  static TextStyle labelMedium(String? fontFamily) => TextStyle(
        fontFamily: fontFamily ?? defaultFontFamily,
        fontSize: 12,
        fontWeight: FontWeight.w500,
        letterSpacing: 0.5,
      );

  static TextStyle labelSmall(String? fontFamily) => TextStyle(
        fontFamily: fontFamily ?? defaultFontFamily,
        fontSize: 10,
        fontWeight: FontWeight.w500,
        letterSpacing: 0.5,
      );
}
