import 'package:intl/intl.dart';

/// Extensões úteis para [DateTime].
extension DateTimeExtensions on DateTime {
  // ============================================
  // FORMATAÇÃO (Português Brasil)
  // ============================================

  /// Formata como data curta (dd/MM/yyyy).
  String get formatShort => DateFormat('dd/MM/yyyy', 'pt_BR').format(this);

  /// Formata como data longa (dd de MMMM de yyyy).
  String get formatLong => DateFormat("dd 'de' MMMM 'de' yyyy", 'pt_BR').format(this);

  /// Formata como data com dia da semana (EEEE, dd de MMMM).
  String get formatWithWeekday =>
      DateFormat("EEEE, dd 'de' MMMM", 'pt_BR').format(this);

  /// Formata apenas hora (HH:mm).
  String get formatTime => DateFormat('HH:mm', 'pt_BR').format(this);

  /// Formata data e hora (dd/MM/yyyy HH:mm).
  String get formatDateTime =>
      DateFormat('dd/MM/yyyy HH:mm', 'pt_BR').format(this);

  /// Formata como mês e ano (MMMM yyyy).
  String get formatMonthYear => DateFormat('MMMM yyyy', 'pt_BR').format(this);

  /// Nome do dia da semana.
  String get weekdayName => DateFormat('EEEE', 'pt_BR').format(this);

  /// Nome do dia da semana abreviado.
  String get weekdayNameShort => DateFormat('EEE', 'pt_BR').format(this);

  /// Nome do mês.
  String get monthName => DateFormat('MMMM', 'pt_BR').format(this);

  /// Nome do mês abreviado.
  String get monthNameShort => DateFormat('MMM', 'pt_BR').format(this);

  // ============================================
  // COMPARAÇÕES
  // ============================================

  /// Verifica se é hoje.
  bool get isToday {
    final now = DateTime.now();
    return year == now.year && month == now.month && day == now.day;
  }

  /// Verifica se é ontem.
  bool get isYesterday {
    final yesterday = DateTime.now().subtract(const Duration(days: 1));
    return year == yesterday.year &&
        month == yesterday.month &&
        day == yesterday.day;
  }

  /// Verifica se é amanhã.
  bool get isTomorrow {
    final tomorrow = DateTime.now().add(const Duration(days: 1));
    return year == tomorrow.year &&
        month == tomorrow.month &&
        day == tomorrow.day;
  }

  /// Verifica se é no passado.
  bool get isPast => isBefore(DateTime.now());

  /// Verifica se é no futuro.
  bool get isFuture => isAfter(DateTime.now());

  /// Verifica se é no mesmo dia que outra data.
  bool isSameDay(DateTime other) {
    return year == other.year && month == other.month && day == other.day;
  }

  /// Verifica se é no mesmo mês que outra data.
  bool isSameMonth(DateTime other) {
    return year == other.year && month == other.month;
  }

  /// Verifica se é no mesmo ano que outra data.
  bool isSameYear(DateTime other) {
    return year == other.year;
  }

  /// Verifica se é fim de semana.
  bool get isWeekend => weekday == DateTime.saturday || weekday == DateTime.sunday;

  /// Verifica se é dia útil.
  bool get isWeekday => !isWeekend;

  // ============================================
  // MANIPULAÇÃO
  // ============================================

  /// Retorna apenas a data (sem hora).
  DateTime get dateOnly => DateTime(year, month, day);

  /// Retorna o início do dia (00:00:00).
  DateTime get startOfDay => DateTime(year, month, day);

  /// Retorna o fim do dia (23:59:59.999).
  DateTime get endOfDay => DateTime(year, month, day, 23, 59, 59, 999);

  /// Retorna o início do mês.
  DateTime get startOfMonth => DateTime(year, month, 1);

  /// Retorna o fim do mês.
  DateTime get endOfMonth => DateTime(year, month + 1, 0, 23, 59, 59, 999);

  /// Retorna o início da semana (Segunda).
  DateTime get startOfWeek {
    final daysToSubtract = weekday - DateTime.monday;
    return DateTime(year, month, day - daysToSubtract);
  }

  /// Retorna o fim da semana (Domingo).
  DateTime get endOfWeek {
    final daysToAdd = DateTime.sunday - weekday;
    return DateTime(year, month, day + daysToAdd, 23, 59, 59, 999);
  }

  /// Adiciona dias.
  DateTime addDays(int days) => add(Duration(days: days));

  /// Subtrai dias.
  DateTime subtractDays(int days) => subtract(Duration(days: days));

  /// Adiciona meses.
  DateTime addMonths(int months) {
    var newMonth = month + months;
    var newYear = year;

    while (newMonth > 12) {
      newMonth -= 12;
      newYear++;
    }

    while (newMonth < 1) {
      newMonth += 12;
      newYear--;
    }

    final maxDay = DateTime(newYear, newMonth + 1, 0).day;
    final newDay = day > maxDay ? maxDay : day;

    return DateTime(newYear, newMonth, newDay, hour, minute, second);
  }

  /// Subtrai meses.
  DateTime subtractMonths(int months) => addMonths(-months);

  /// Adiciona anos.
  DateTime addYears(int years) => DateTime(year + years, month, day, hour, minute, second);

  /// Subtrai anos.
  DateTime subtractYears(int years) => addYears(-years);

  // ============================================
  // CÁLCULOS
  // ============================================

  /// Número de dias no mês atual.
  int get daysInMonth => DateTime(year, month + 1, 0).day;

  /// Diferença em dias para outra data.
  int daysDifference(DateTime other) {
    return dateOnly.difference(other.dateOnly).inDays.abs();
  }

  /// Diferença em meses para outra data (aproximado).
  int monthsDifference(DateTime other) {
    return ((year - other.year) * 12 + (month - other.month)).abs();
  }

  /// Idade em anos completos.
  int ageInYears(DateTime birthDate) {
    int age = year - birthDate.year;
    if (month < birthDate.month ||
        (month == birthDate.month && day < birthDate.day)) {
      age--;
    }
    return age;
  }

  // ============================================
  // DESCRIÇÃO RELATIVA
  // ============================================

  /// Descrição relativa (hoje, ontem, amanhã, etc).
  String get relativeDescription {
    if (isToday) return 'Hoje';
    if (isYesterday) return 'Ontem';
    if (isTomorrow) return 'Amanhã';

    final now = DateTime.now();
    final diff = dateOnly.difference(now.dateOnly).inDays;

    if (diff > 0 && diff <= 7) {
      return weekdayName.substring(0, 1).toUpperCase() +
          weekdayName.substring(1);
    }

    if (isSameYear(now)) {
      return DateFormat("dd 'de' MMMM", 'pt_BR').format(this);
    }

    return formatLong;
  }

  /// Tempo decorrido em formato legível.
  String get timeAgo {
    final now = DateTime.now();
    final diff = now.difference(this);

    if (diff.isNegative) return 'no futuro';

    if (diff.inSeconds < 60) return 'agora';
    if (diff.inMinutes < 60) {
      return '${diff.inMinutes} min atrás';
    }
    if (diff.inHours < 24) {
      return '${diff.inHours}h atrás';
    }
    if (diff.inDays < 7) {
      return '${diff.inDays} dia${diff.inDays > 1 ? 's' : ''} atrás';
    }
    if (diff.inDays < 30) {
      final weeks = (diff.inDays / 7).floor();
      return '$weeks semana${weeks > 1 ? 's' : ''} atrás';
    }
    if (diff.inDays < 365) {
      final months = (diff.inDays / 30).floor();
      return '$months ${months > 1 ? 'meses' : 'mês'} atrás';
    }

    final years = (diff.inDays / 365).floor();
    return '$years ano${years > 1 ? 's' : ''} atrás';
  }
}

/// Extensões para [DateTime?] nullable.
extension NullableDateTimeExtensions on DateTime? {
  /// Verifica se é nulo.
  bool get isNull => this == null;

  /// Verifica se não é nulo.
  bool get isNotNull => this != null;

  /// Retorna a data ou DateTime.now() se nulo.
  DateTime get orNow => this ?? DateTime.now();

  /// Formata ou retorna string vazia se nulo.
  String formatOrEmpty(String Function(DateTime) formatter) {
    return this != null ? formatter(this!) : '';
  }
}
