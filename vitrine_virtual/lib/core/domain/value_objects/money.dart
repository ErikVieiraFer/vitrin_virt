import 'package:equatable/equatable.dart';

/// Value Object para valores monetários em Real brasileiro.
///
/// Armazena o valor em centavos (int) para evitar problemas de
/// precisão com double. Fornece formatação para exibição.
class Money extends Equatable {
  /// Valor em centavos.
  final int _cents;

  const Money._(this._cents);

  /// Cria Money a partir de um valor em reais (double).
  factory Money.fromReais(double value) {
    final cents = (value * 100).round();
    return Money._(cents);
  }

  /// Cria Money a partir de centavos.
  factory Money.fromCents(int cents) => Money._(cents);

  /// Cria Money zero.
  factory Money.zero() => const Money._(0);

  /// Valor em centavos.
  int get cents => _cents;

  /// Valor em reais (double).
  double get inReais => _cents / 100;

  /// Verifica se é zero.
  bool get isZero => _cents == 0;

  /// Verifica se é positivo.
  bool get isPositive => _cents > 0;

  /// Verifica se é negativo.
  bool get isNegative => _cents < 0;

  /// Verifica se é gratuito (zero ou negativo).
  bool get isFree => _cents <= 0;

  /// Formata o valor em Real brasileiro: R$ 99,90
  String get formatted {
    final reais = _cents ~/ 100;
    final centavos = (_cents % 100).abs();
    return 'R\$ $reais,${centavos.toString().padLeft(2, '0')}';
  }

  /// Formata sem o símbolo: 99,90
  String get formattedWithoutSymbol {
    final reais = _cents ~/ 100;
    final centavos = (_cents % 100).abs();
    return '$reais,${centavos.toString().padLeft(2, '0')}';
  }

  /// Formata com separador de milhar: R$ 1.234,56
  String get formattedWithThousands {
    final reais = _cents ~/ 100;
    final centavos = (_cents % 100).abs();
    final reaisFormatted = _formatWithThousands(reais);
    return 'R\$ $reaisFormatted,${centavos.toString().padLeft(2, '0')}';
  }

  String _formatWithThousands(int value) {
    final str = value.abs().toString();
    final buffer = StringBuffer();
    var count = 0;

    for (var i = str.length - 1; i >= 0; i--) {
      if (count > 0 && count % 3 == 0) {
        buffer.write('.');
      }
      buffer.write(str[i]);
      count++;
    }

    final result = buffer.toString().split('').reversed.join();
    return value < 0 ? '-$result' : result;
  }

  /// Operações matemáticas.
  Money operator +(Money other) => Money._(_cents + other._cents);
  Money operator -(Money other) => Money._(_cents - other._cents);
  Money operator *(num factor) => Money._((_cents * factor).round());
  Money operator /(num divisor) => Money._((_cents / divisor).round());

  /// Comparações.
  bool operator <(Money other) => _cents < other._cents;
  bool operator <=(Money other) => _cents <= other._cents;
  bool operator >(Money other) => _cents > other._cents;
  bool operator >=(Money other) => _cents >= other._cents;

  @override
  String toString() => formatted;

  @override
  List<Object?> get props => [_cents];
}
