import 'package:equatable/equatable.dart';

/// Value Object para número de telefone brasileiro.
///
/// Valida e normaliza números de telefone no formato brasileiro.
/// Armazena apenas os dígitos, sem formatação.
class Phone extends Equatable {
  final String _value;

  const Phone._(this._value);

  /// Cria um Phone a partir de uma string.
  /// Remove todos os caracteres não numéricos.
  factory Phone(String value) {
    final digits = value.replaceAll(RegExp(r'[^\d]'), '');
    return Phone._(digits);
  }

  /// Cria um Phone vazio.
  factory Phone.empty() => const Phone._('');

  /// Valor bruto (apenas dígitos).
  String get value => _value;

  /// Verifica se o telefone é válido (10 ou 11 dígitos).
  bool get isValid {
    return _value.length == 10 || _value.length == 11;
  }

  /// Verifica se é celular (11 dígitos, começando com 9).
  bool get isMobile {
    if (_value.length != 11) return false;
    // Formato: DDD (2) + 9 + número (8)
    return _value[2] == '9';
  }

  /// Verifica se é fixo (10 dígitos).
  bool get isLandline => _value.length == 10;

  /// Verifica se está vazio.
  bool get isEmpty => _value.isEmpty;

  /// Verifica se não está vazio.
  bool get isNotEmpty => _value.isNotEmpty;

  /// Retorna o DDD (2 primeiros dígitos).
  String get areaCode {
    if (_value.length < 2) return '';
    return _value.substring(0, 2);
  }

  /// Retorna o número sem DDD.
  String get numberWithoutAreaCode {
    if (_value.length <= 2) return '';
    return _value.substring(2);
  }

  /// Formata o telefone para exibição: (XX) XXXXX-XXXX ou (XX) XXXX-XXXX.
  String get formatted {
    if (!isValid) return _value;

    final ddd = areaCode;
    final number = numberWithoutAreaCode;

    if (isMobile) {
      // (XX) XXXXX-XXXX
      return '($ddd) ${number.substring(0, 5)}-${number.substring(5)}';
    } else {
      // (XX) XXXX-XXXX
      return '($ddd) ${number.substring(0, 4)}-${number.substring(4)}';
    }
  }

  /// Formata para WhatsApp (com código do país).
  String get whatsappFormat {
    if (isEmpty) return '';
    // Remove o 0 inicial se houver e adiciona 55 (Brasil)
    final cleanNumber = _value.startsWith('0') ? _value.substring(1) : _value;
    return '55$cleanNumber';
  }

  /// URL para abrir WhatsApp.
  String whatsappUrl({String? message}) {
    if (isEmpty) return '';
    final baseUrl = 'https://wa.me/$whatsappFormat';
    if (message != null && message.isNotEmpty) {
      return '$baseUrl?text=${Uri.encodeComponent(message)}';
    }
    return baseUrl;
  }

  @override
  String toString() => formatted;

  @override
  List<Object?> get props => [_value];
}
