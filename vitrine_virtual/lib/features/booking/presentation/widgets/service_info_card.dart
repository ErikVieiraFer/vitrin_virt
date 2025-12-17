import 'package:flutter/material.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_spacing.dart';
import '../../../services/domain/entities/service.dart';

/// Card com informações detalhadas do serviço.
class ServiceInfoCard extends StatelessWidget {
  final Service service;

  const ServiceInfoCard({super.key, required this.service});

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: AppSpacing.paddingMd,
      child: Padding(
        padding: AppSpacing.paddingMd,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Sobre o serviço',
              style: Theme.of(context).textTheme.titleLarge?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
            ),
            AppSpacing.verticalSm,
            Text(
              service.description,
              style: Theme.of(context).textTheme.bodyLarge,
            ),
            AppSpacing.verticalMd,
            const Divider(),
            AppSpacing.verticalMd,
            Row(
              children: [
                Expanded(
                  child: _InfoItem(
                    icon: Icons.access_time,
                    label: 'Duração',
                    value: service.formattedDuration,
                  ),
                ),
                Container(
                  width: 1,
                  height: 40,
                  color: AppColors.divider,
                ),
                Expanded(
                  child: _InfoItem(
                    icon: Icons.attach_money,
                    label: 'Preço',
                    value: service.formattedPrice,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _InfoItem extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;

  const _InfoItem({
    required this.icon,
    required this.label,
    required this.value,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Icon(
          icon,
          size: AppSpacing.iconLg,
          color: Theme.of(context).colorScheme.primary,
        ),
        AppSpacing.verticalSm,
        Text(
          label,
          style: Theme.of(context).textTheme.bodySmall?.copyWith(
                color: AppColors.textSecondary,
              ),
        ),
        AppSpacing.verticalXs,
        Text(
          value,
          style: Theme.of(context).textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.bold,
              ),
        ),
      ],
    );
  }
}
