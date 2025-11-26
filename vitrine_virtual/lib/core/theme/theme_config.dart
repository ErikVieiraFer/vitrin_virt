import 'package:flutter/material.dart';
import 'app_colors.dart';
import 'app_text_styles.dart';

class ThemeConfig {
  static ThemeData buildTheme({
    required Color primaryColor,
    required Color secondaryColor,
    String? fontFamily,
  }) {
    return ThemeData(
      useMaterial3: true,
      colorScheme: ColorScheme.fromSeed(
        seedColor: primaryColor,
        secondary: secondaryColor,
        brightness: Brightness.light,
      ),
      scaffoldBackgroundColor: AppColors.backgroundLight,
      appBarTheme: AppBarTheme(
        elevation: 0,
        centerTitle: true,
        backgroundColor: primaryColor,
        foregroundColor: AppColors.textWhite,
        titleTextStyle: AppTextStyles.headlineMedium(fontFamily).copyWith(
          color: AppColors.textWhite,
        ),
      ),
      cardTheme: CardThemeData(
        elevation: 2,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
        color: AppColors.surfaceLight,
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: primaryColor,
          foregroundColor: AppColors.textWhite,
          elevation: 2,
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(8),
          ),
          textStyle: AppTextStyles.labelLarge(fontFamily),
        ),
      ),
      textButtonTheme: TextButtonThemeData(
        style: TextButton.styleFrom(
          foregroundColor: primaryColor,
          textStyle: AppTextStyles.labelLarge(fontFamily),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: AppColors.surfaceLight,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: const BorderSide(color: AppColors.border),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: const BorderSide(color: AppColors.border),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: BorderSide(color: primaryColor, width: 2),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: const BorderSide(color: AppColors.error),
        ),
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        labelStyle: AppTextStyles.bodyMedium(fontFamily).copyWith(
          color: AppColors.textSecondary,
        ),
        hintStyle: AppTextStyles.bodyMedium(fontFamily).copyWith(
          color: AppColors.textDisabled,
        ),
      ),
      textTheme: TextTheme(
        displayLarge: AppTextStyles.displayLarge(fontFamily),
        displayMedium: AppTextStyles.displayMedium(fontFamily),
        displaySmall: AppTextStyles.displaySmall(fontFamily),
        headlineLarge: AppTextStyles.headlineLarge(fontFamily),
        headlineMedium: AppTextStyles.headlineMedium(fontFamily),
        headlineSmall: AppTextStyles.headlineSmall(fontFamily),
        bodyLarge: AppTextStyles.bodyLarge(fontFamily),
        bodyMedium: AppTextStyles.bodyMedium(fontFamily),
        bodySmall: AppTextStyles.bodySmall(fontFamily),
        labelLarge: AppTextStyles.labelLarge(fontFamily),
        labelMedium: AppTextStyles.labelMedium(fontFamily),
        labelSmall: AppTextStyles.labelSmall(fontFamily),
      ),
      dividerTheme: const DividerThemeData(
        color: AppColors.divider,
        thickness: 1,
      ),
    );
  }

  static ThemeData get defaultTheme => buildTheme(
        primaryColor: AppColors.defaultPrimary,
        secondaryColor: AppColors.defaultSecondary,
      );
}
