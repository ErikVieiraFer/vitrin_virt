import 'package:flutter/material.dart';
import '../../../../core/constants/app_constants.dart';
import '../../../../core/utils/date_time_helper.dart';

class CalendarPicker extends StatelessWidget {
  final DateTime? selectedDate;
  final Function(DateTime) onDateSelected;

  const CalendarPicker({
    super.key,
    this.selectedDate,
    required this.onDateSelected,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.all(16),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Selecione a data',
              style: Theme.of(context).textTheme.titleLarge?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
            ),
            const SizedBox(height: 16),
            CalendarDatePicker(
              initialDate: selectedDate ?? DateTimeHelper.today,
              firstDate: DateTimeHelper.today,
              lastDate: DateTimeHelper.addDays(
                DateTimeHelper.today,
                AppConstants.maxAdvanceBookingDays,
              ),
              currentDate: selectedDate,
              onDateChanged: onDateSelected,
            ),
          ],
        ),
      ),
    );
  }
}
