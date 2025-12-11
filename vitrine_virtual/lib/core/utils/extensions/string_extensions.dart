/// Extensões úteis para [String].
extension StringExtensions on String {
  // ============================================
  // VALIDAÇÃO
  // ============================================

  /// Verifica se a string é um email válido.
  bool get isValidEmail {
    final regex = RegExp(
      r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$',
    );
    return regex.hasMatch(this);
  }

  /// Verifica se a string é um telefone brasileiro válido.
  bool get isValidBrazilianPhone {
    final digitsOnly = replaceAll(RegExp(r'\D'), '');
    // Aceita: 11 dígitos (DDD + 9 dígitos) ou 13 dígitos (55 + DDD + 9 dígitos)
    return digitsOnly.length == 11 ||
        (digitsOnly.length == 13 && digitsOnly.startsWith('55'));
  }

  /// Verifica se a string é um CPF válido (apenas formato, não validação).
  bool get isValidCPFFormat {
    final digitsOnly = replaceAll(RegExp(r'\D'), '');
    return digitsOnly.length == 11;
  }

  /// Verifica se a string é um CNPJ válido (apenas formato).
  bool get isValidCNPJFormat {
    final digitsOnly = replaceAll(RegExp(r'\D'), '');
    return digitsOnly.length == 14;
  }

  /// Verifica se a string é um CEP válido (apenas formato).
  bool get isValidCEPFormat {
    final digitsOnly = replaceAll(RegExp(r'\D'), '');
    return digitsOnly.length == 8;
  }

  /// Verifica se é uma URL válida.
  bool get isValidUrl {
    final uri = Uri.tryParse(this);
    return uri != null && (uri.scheme == 'http' || uri.scheme == 'https');
  }

  /// Verifica se é um código hexadecimal de cor válido.
  bool get isValidHexColor {
    final regex = RegExp(r'^#?([0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$');
    return regex.hasMatch(this);
  }

  // ============================================
  // TRANSFORMAÇÃO
  // ============================================

  /// Capitaliza a primeira letra.
  String get capitalize {
    if (isEmpty) return this;
    return '${this[0].toUpperCase()}${substring(1).toLowerCase()}';
  }

  /// Capitaliza a primeira letra de cada palavra.
  String get capitalizeWords {
    if (isEmpty) return this;
    return split(' ').map((word) => word.capitalize).join(' ');
  }

  /// Remove todos os caracteres não numéricos.
  String get digitsOnly => replaceAll(RegExp(r'\D'), '');

  /// Remove todos os espaços em branco extras.
  String get normalizeWhitespace {
    return trim().replaceAll(RegExp(r'\s+'), ' ');
  }

  /// Remove acentos e caracteres especiais.
  String get removeAccents {
    const withAccents = 'àáâãäåèéêëìíîïòóôõöùúûüçñÀÁÂÃÄÅÈÉÊËÌÍÎÏÒÓÔÕÖÙÚÛÜÇÑ';
    const withoutAccents = 'aaaaaaeeeeiiiiooooouuuucnAAAAAAEEEEIIIIOOOOOUUUUCN';

    String result = this;
    for (int i = 0; i < withAccents.length; i++) {
      result = result.replaceAll(withAccents[i], withoutAccents[i]);
    }
    return result;
  }

  /// Converte para slug (URL amigável).
  String get toSlug {
    return removeAccents
        .toLowerCase()
        .replaceAll(RegExp(r'[^a-z0-9\s-]'), '')
        .replaceAll(RegExp(r'\s+'), '-')
        .replaceAll(RegExp(r'-+'), '-');
  }

  // ============================================
  // FORMATAÇÃO BRASILEIRA
  // ============================================

  /// Formata como telefone brasileiro (+55 XX XXXXX-XXXX).
  String get formatAsBrazilianPhone {
    final digits = digitsOnly;

    if (digits.length == 11) {
      final ddd = digits.substring(0, 2);
      final firstPart = digits.substring(2, 7);
      final secondPart = digits.substring(7);
      return '+55 $ddd $firstPart-$secondPart';
    }

    if (digits.length == 13 && digits.startsWith('55')) {
      final ddd = digits.substring(2, 4);
      final firstPart = digits.substring(4, 9);
      final secondPart = digits.substring(9);
      return '+55 $ddd $firstPart-$secondPart';
    }

    return this;
  }

  /// Formata como CPF (XXX.XXX.XXX-XX).
  String get formatAsCPF {
    final digits = digitsOnly;
    if (digits.length != 11) return this;

    return '${digits.substring(0, 3)}.${digits.substring(3, 6)}.'
        '${digits.substring(6, 9)}-${digits.substring(9)}';
  }

  /// Formata como CNPJ (XX.XXX.XXX/XXXX-XX).
  String get formatAsCNPJ {
    final digits = digitsOnly;
    if (digits.length != 14) return this;

    return '${digits.substring(0, 2)}.${digits.substring(2, 5)}.'
        '${digits.substring(5, 8)}/${digits.substring(8, 12)}-'
        '${digits.substring(12)}';
  }

  /// Formata como CEP (XXXXX-XXX).
  String get formatAsCEP {
    final digits = digitsOnly;
    if (digits.length != 8) return this;

    return '${digits.substring(0, 5)}-${digits.substring(5)}';
  }

  // ============================================
  // UTILIDADES
  // ============================================

  /// Retorna null se a string estiver vazia ou apenas com espaços.
  String? get nullIfEmpty => trim().isEmpty ? null : this;

  /// Trunca a string para um tamanho máximo, adicionando reticências.
  String truncate(int maxLength, {String suffix = '...'}) {
    if (length <= maxLength) return this;
    return '${substring(0, maxLength - suffix.length)}$suffix';
  }

  /// Verifica se contém outra string ignorando case.
  bool containsIgnoreCase(String other) {
    return toLowerCase().contains(other.toLowerCase());
  }

  /// Verifica se é igual a outra string ignorando case.
  bool equalsIgnoreCase(String other) {
    return toLowerCase() == other.toLowerCase();
  }

  /// Conta ocorrências de um padrão.
  int countOccurrences(String pattern) {
    return split(pattern).length - 1;
  }

  /// Reverte a string.
  String get reversed => split('').reversed.join('');

  /// Verifica se a string contém apenas letras.
  bool get isAlpha => RegExp(r'^[a-zA-Z]+$').hasMatch(this);

  /// Verifica se a string contém apenas números.
  bool get isNumeric => RegExp(r'^[0-9]+$').hasMatch(this);

  /// Verifica se a string contém apenas letras e números.
  bool get isAlphanumeric => RegExp(r'^[a-zA-Z0-9]+$').hasMatch(this);
}

/// Extensões para [String?] nullable.
extension NullableStringExtensions on String? {
  /// Verifica se a string é nula ou vazia.
  bool get isNullOrEmpty => this == null || this!.trim().isEmpty;

  /// Verifica se a string não é nula nem vazia.
  bool get isNotNullOrEmpty => !isNullOrEmpty;

  /// Retorna a string ou um valor padrão.
  String orDefault([String defaultValue = '']) => this ?? defaultValue;
}
