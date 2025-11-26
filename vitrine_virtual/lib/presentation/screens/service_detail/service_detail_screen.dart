import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../../data/models/service_model.dart';
import '../../../data/models/tenant_model.dart';
import '../../widgets/custom_button.dart';
import 'widgets/service_info_card.dart';

class ServiceDetailScreen extends StatelessWidget {
  final ServiceModel service;
  final TenantModel tenant;

  const ServiceDetailScreen({
    super.key,
    required this.service,
    required this.tenant,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            expandedHeight: 300,
            pinned: true,
            flexibleSpace: FlexibleSpaceBar(
              title: Text(
                service.name,
                style: const TextStyle(
                  shadows: [
                    Shadow(
                      color: Color.fromRGBO(0, 0, 0, 0.5),
                      blurRadius: 8,
                    ),
                  ],
                ),
              ),
              background: CachedNetworkImage(
                imageUrl: service.imageUrl,
                fit: BoxFit.cover,
                placeholder: (context, url) => const Center(
                  child: CircularProgressIndicator(),
                ),
                errorWidget: (context, url, error) => const Icon(
                  Icons.image_not_supported,
                  size: 100,
                ),
              ),
            ),
          ),
          SliverToBoxAdapter(
            child: Column(
              children: [
                ServiceInfoCard(service: service),
                const SizedBox(height: 80),
              ],
            ),
          ),
        ],
      ),
      bottomNavigationBar: _buildBottomBar(context),
    );
  }

  Widget _buildBottomBar(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.1),
            blurRadius: 8,
            offset: const Offset(0, -2),
          ),
        ],
      ),
      child: SafeArea(
        child: CustomButton(
          text: 'Continuar para Agendamento',
          icon: Icons.calendar_today,
          onPressed: () => _navigateToBooking(context),
        ),
      ),
    );
  }

  void _navigateToBooking(BuildContext context) {
    Navigator.pushNamed(
      context,
      '/booking',
      arguments: {
        'service': service,
        'tenant': tenant,
      },
    );
  }
}
