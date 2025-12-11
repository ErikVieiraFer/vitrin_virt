import 'package:flutter/material.dart';

import '../../../../core/domain/value_objects/time_slot.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_spacing.dart';
import '../../../../shared/widgets/empty_state.dart';

/// Grid de horários disponíveis.
class TimeSlotGrid extends StatelessWidget {
  final List<TimeSlot> slots;
  final TimeSlot? selectedSlot;
  final Function(TimeSlot) onSlotSelected;

  const TimeSlotGrid({
    super.key,
    required this.slots,
    this.selectedSlot,
    required this.onSlotSelected,
  });

  @override
  Widget build(BuildContext context) {
    if (slots.isEmpty) {
      return Card(
        margin: AppSpacing.paddingHorizontalMd,
        child: const EmptyState.noSlots(),
      );
    }

    return Card(
      margin: AppSpacing.paddingHorizontalMd,
      child: Padding(
        padding: AppSpacing.paddingMd,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Horários disponíveis',
              style: Theme.of(context).textTheme.titleLarge?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
            ),
            AppSpacing.verticalMd,
            Wrap(
              spacing: AppSpacing.sm,
              runSpacing: AppSpacing.sm,
              children: slots.map((slot) {
                final isSelected = slot == selectedSlot;
                return _TimeSlotChip(
                  slot: slot,
                  isSelected: isSelected,
                  onTap: () => onSlotSelected(slot),
                );
              }).toList(),
            ),
          ],
        ),
      ),
    );
  }
}

class _TimeSlotChip extends StatelessWidget {
  final TimeSlot slot;
  final bool isSelected;
  final VoidCallback onTap;

  const _TimeSlotChip({
    required this.slot,
    required this.isSelected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(8),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        decoration: BoxDecoration(
          color: isSelected
              ? Theme.of(context).colorScheme.primary
              : AppColors.backgroundLight,
          border: Border.all(
            color: isSelected
                ? Theme.of(context).colorScheme.primary
                : AppColors.border,
            width: 2,
          ),
          borderRadius: BorderRadius.circular(8),
        ),
        child: Text(
          slot.formatted,
          style: Theme.of(context).textTheme.labelLarge?.copyWith(
                color: isSelected ? Colors.white : AppColors.textPrimary,
                fontWeight: FontWeight.bold,
              ),
        ),
      ),
    );
  }
}
