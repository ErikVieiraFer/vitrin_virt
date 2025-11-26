import 'package:intl/intl.dart';

class DateTimeHelper {
  static DateTime get today {
    final now = DateTime.now();
    return DateTime(now.year, now.month, now.day);
  }

  static bool isPastDate(DateTime date) {
    return date.isBefore(today);
  }

  static String formatDate(DateTime date, {String pattern = 'dd/MM/yyyy'}) {
    return DateFormat(pattern, 'pt_BR').format(date);
  }

  static String formatTime(String time) {
    try {
      final parts = time.split(':');
      if (parts.length != 2) return time;
      final hour = int.parse(parts[0]);
      final minute = int.parse(parts[1]);
      return '${hour.toString().padLeft(2, '0')}:${minute.toString().padLeft(2, '0')}';
    } catch (e) {
      return time;
    }
  }

  static DateTime parseTime(String time) {
    final parts = time.split(':');
    return DateTime(0, 1, 1, int.parse(parts[0]), int.parse(parts[1]));
  }

  static List<String> generateTimeSlots({
    required String startTime,
    required String endTime,
    required int durationMinutes,
  }) {
    final slots = <String>[];
    final start = parseTime(startTime);
    final end = parseTime(endTime);

    var current = start;
    while (current.isBefore(end)) {
      slots.add(formatTime('${current.hour}:${current.minute}'));
      current = current.add(Duration(minutes: durationMinutes));
    }

    return slots;
  }

  static String getDayName(DateTime date) {
    return DateFormat('EEEE', 'pt_BR').format(date);
  }

  static String getMonthName(DateTime date) {
    return DateFormat('MMMM', 'pt_BR').format(date);
  }

  static int getDayOfWeek(DateTime date) {
    return date.weekday;
  }

  static bool isSameDay(DateTime date1, DateTime date2) {
    return date1.year == date2.year &&
        date1.month == date2.month &&
        date1.day == date2.day;
  }

  static DateTime addDays(DateTime date, int days) {
    return date.add(Duration(days: days));
  }

  static String formatDateTime(DateTime dateTime) {
    return DateFormat('dd/MM/yyyy HH:mm', 'pt_BR').format(dateTime);
  }

  static String getRelativeDate(DateTime date) {
    final now = today;
    final difference = date.difference(now).inDays;

    if (difference == 0) return 'Hoje';
    if (difference == 1) return 'Amanhã';
    if (difference == -1) return 'Ontem';

    return formatDate(date);
  }
}
