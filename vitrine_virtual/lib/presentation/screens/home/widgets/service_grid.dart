import 'package:flutter/material.dart';
import '../../../../core/constants/app_constants.dart';
import '../../../../data/models/service_model.dart';
import 'service_card.dart';

class ServiceGrid extends StatelessWidget {
  final List<ServiceModel> services;
  final Function(ServiceModel) onServiceTap;

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
      return const Center(
        child: Padding(
          padding: EdgeInsets.all(24.0),
          child: Text('Nenhum serviço disponível no momento'),
        ),
      );
    }

    return GridView.builder(
      padding: const EdgeInsets.all(16),
      gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: crossAxisCount,
        crossAxisSpacing: 16,
        mainAxisSpacing: 16,
        childAspectRatio: 0.75,
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
