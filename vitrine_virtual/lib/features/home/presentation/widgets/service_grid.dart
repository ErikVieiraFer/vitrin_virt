import 'package:flutter/material.dart';

import '../../../../core/constants/app_constants.dart';
import '../../../../core/theme/app_spacing.dart';
import '../../../../shared/widgets/empty_state.dart';
import '../../../services/domain/entities/service.dart';
import 'service_card.dart';

/// Grid responsivo de serviços.
class ServiceGrid extends StatelessWidget {
  final List<Service> services;
  final Function(Service) onServiceTap;

  const ServiceGrid({
    super.key,
    required this.services,
    required this.onServiceTap,
  });

  @override
  Widget build(BuildContext context) {
    final screenWidth = MediaQuery.of(context).size.width;
    final crossAxisCount = _getCrossAxisCount(screenWidth);

    if (services.isEmpty) {
      return const EmptyState.noServices();
    }

    return GridView.builder(
      padding: AppSpacing.paddingMd,
      gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: crossAxisCount,
        crossAxisSpacing: AppSpacing.md,
        mainAxisSpacing: AppSpacing.md,
        childAspectRatio: AppConstants.serviceCardAspectRatio,
      ),
      itemCount: services.length,
      itemBuilder: (context, index) {
        return ServiceCard(
          service: services[index],
          onTap: () => onServiceTap(services[index]),
        );
      },
    );
  }

  int _getCrossAxisCount(double screenWidth) {
    if (screenWidth >= AppConstants.breakpointTablet) {
      return 3;
    } else if (screenWidth >= AppConstants.breakpointMobile) {
      return 2;
    }
    return 1;
  }
}
