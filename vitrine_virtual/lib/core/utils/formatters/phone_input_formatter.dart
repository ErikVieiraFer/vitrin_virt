import 'package:flutter/services.dart';

import '../../constants/app_constants.dart';

/// Formatter para mascara de telefone brasileiro.
///
/// Formata automaticamente para: +55 XX XXXXX-XXXX
class BrazilianPhoneFormatter extends TextInputFormatter {
  @override
  TextEditingValue formatEditUpdate(
    TextEditingValue oldValue,
    TextEditingValue newValue,
  ) {
    String digits = newValue.text.replaceAll(RegExp(r'\D'), '');

    if (digits.isEmpty) {
      return const TextEditingValue(
        text: '',
        selection: TextSelection.collapsed(offset: 0),
      );
    }

    // Adiciona codigo do pais se nao existir
    if (!digits.startsWith('55')) {
      digits = '55$digits';
    }

    // Limita ao tamanho completo (com codigo do pais)
    if (digits.length > AppConstants.brazilianPhoneFullLength) {
      digits = digits.substring(0, AppConstants.brazilianPhoneFullLength);
    }

    // Formata: +55 XX XXXXX-XXXX
    final buffer = StringBuffer();

    for (int i = 0; i < digits.length; i++) {
      if (i == 0) buffer.write('+');
      if (i == 2) buffer.write(' ');
      if (i == 4) buffer.write(' ');
      if (i == 9) buffer.write('-');
      buffer.write(digits[i]);
    }

    final formatted = buffer.toString();

    return TextEditingValue(
      text: formatted,
      selection: TextSelection.collapsed(offset: formatted.length),
    );
  }
}
