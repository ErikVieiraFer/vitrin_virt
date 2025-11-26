import 'package:flutter/material.dart';

class AppColors {
  static const Color defaultPrimary = Color.fromRGBO(33, 150, 243, 1.0);
  static const Color defaultSecondary = Color.fromRGBO(255, 152, 0, 1.0);
  static const Color defaultAccent = Color.fromRGBO(76, 175, 80, 1.0);

  static const Color backgroundLight = Color.fromRGBO(250, 250, 250, 1.0);
  static const Color backgroundDark = Color.fromRGBO(18, 18, 18, 1.0);
  static const Color surfaceLight = Color.fromRGBO(255, 255, 255, 1.0);
  static const Color surfaceDark = Color.fromRGBO(30, 30, 30, 1.0);

  static const Color textPrimary = Color.fromRGBO(33, 33, 33, 1.0);
  static const Color textSecondary = Color.fromRGBO(117, 117, 117, 1.0);
  static const Color textDisabled = Color.fromRGBO(189, 189, 189, 1.0);
  static const Color textWhite = Color.fromRGBO(255, 255, 255, 1.0);

  static const Color error = Color.fromRGBO(244, 67, 54, 1.0);
  static const Color success = Color.fromRGBO(76, 175, 80, 1.0);
  static const Color warning = Color.fromRGBO(255, 152, 0, 1.0);
  static const Color info = Color.fromRGBO(33, 150, 243, 1.0);

  static const Color divider = Color.fromRGBO(224, 224, 224, 1.0);
  static const Color border = Color.fromRGBO(189, 189, 189, 1.0);
  static const Color shadow = Color.fromRGBO(0, 0, 0, 0.1);

  static Color fromHex(String hexString) {
    final buffer = StringBuffer();
    if (hexString.length == 6 || hexString.length == 7) buffer.write('ff');
    buffer.write(hexString.replaceFirst('#', ''));
    return Color(int.parse(buffer.toString(), radix: 16));
  }
}
