import '../constants/app_constants.dart';

class Validators {
  static String? validateName(String? value) {
    if (value == null || value.trim().isEmpty) {
      return 'Nome é obrigatório';
    }

    final trimmedValue = value.trim();

    if (trimmedValue.length < AppConstants.minNameLength) {
      return 'Nome deve ter no mínimo ${AppConstants.minNameLength} caracteres';
    }

    if (trimmedValue.length > AppConstants.maxNameLength) {
      return 'Nome deve ter no máximo ${AppConstants.maxNameLength} caracteres';
    }

    return null;
  }

  static String? validatePhone(String? value) {
    if (value == null || value.trim().isEmpty) {
      return 'Telefone é obrigatório';
    }

    // Remove toda formatação: espaços, traços, parênteses, +
    final digitsOnly = value.replaceAll(RegExp(r'[^\d]'), '');

    // Remove o código do país (55) se o número tiver 12 ou 13 dígitos
    final localDigits = (digitsOnly.startsWith('55') &&
            (digitsOnly.length == 12 || digitsOnly.length == 13))
        ? digitsOnly.substring(2)
        : digitsOnly;

    // Número brasileiro: 10 dígitos (fixo) ou 11 dígitos (celular com 9)
    if (localDigits.length < 10 || localDigits.length > 11) {
      return 'Telefone inválido. Use: (27) 99999-9999';
    }

    final ddd = int.tryParse(localDigits.substring(0, 2));
    if (ddd == null || ddd < 11 || ddd > 99) {
      return 'DDD inválido';
    }

    return null;
  }

  static String? validateEmail(String? value) {
    if (value == null || value.trim().isEmpty) {
      return 'E-mail é obrigatório';
    }

    final emailRegex = RegExp(
      r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$',
    );

    if (!emailRegex.hasMatch(value.trim())) {
      return 'E-mail inválido';
    }

    return null;
  }

  static String? validateRequired(String? value, String fieldName) {
    if (value == null || value.trim().isEmpty) {
      return '$fieldName é obrigatório';
    }
    return null;
  }

  static String formatPhone(String phone) {
    final digitsOnly = phone.replaceAll(RegExp(r'[^\d]'), '');

    if (digitsOnly.length == 13 && digitsOnly.startsWith('55')) {
      final countryCode = digitsOnly.substring(0, 2);
      final ddd = digitsOnly.substring(2, 4);
      final firstPart = digitsOnly.substring(4, 9);
      final secondPart = digitsOnly.substring(9, 13);
      return '+$countryCode $ddd $firstPart-$secondPart';
    }

    if (digitsOnly.length == 11) {
      final ddd = digitsOnly.substring(0, 2);
      final firstPart = digitsOnly.substring(2, 7);
      final secondPart = digitsOnly.substring(7, 11);
      return '+55 $ddd $firstPart-$secondPart';
    }

    return phone;
  }
}
