import 'package:flutter/material.dart';

import '../../../../core/theme/app_spacing.dart';
import '../../../services/domain/entities/service.dart';
import '../../../tenant/domain/entities/vitrine_section.dart';
import 'animated_service_card.dart';

/// Renderiza as seções customizáveis da vitrine (editor visual do painel).
///
/// Tipos suportados: hero, text, gallery, services. A seção 'services' reaproveita
/// os serviços já carregados. Ver /SCHEMA.md (tenants.sections).
class VitrineSectionsView extends StatelessWidget {
  final List<VitrineSection> sections;
  final List<Service> services;
  final void Function(Service) onServiceTap;

  const VitrineSectionsView({
    super.key,
    required this.sections,
    required this.services,
    required this.onServiceTap,
  });

  @override
  Widget build(BuildContext context) {
    final sorted = [...sections]..sort((a, b) => a.order.compareTo(b.order));
    return ListView(
      padding: EdgeInsets.zero,
      children: sorted.map((s) => _buildSection(context, s)).toList(),
    );
  }

  Widget _buildSection(BuildContext context, VitrineSection section) {
    switch (section.type) {
      case 'hero':
        return _HeroSection(section: section);
      case 'text':
        return _TextSection(section: section);
      case 'gallery':
        return _GallerySection(section: section);
      case 'services':
        return _ServicesSection(
          services: services,
          onServiceTap: onServiceTap,
          cardStyle: section.cardStyle,
          showPrices: section.showPrices,
        );
      default:
        return const SizedBox.shrink();
    }
  }
}

class _HeroSection extends StatelessWidget {
  final VitrineSection section;
  const _HeroSection({required this.section});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final hasImage = section.imageUrl.isNotEmpty;
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(vertical: 56, horizontal: 24),
      decoration: BoxDecoration(
        color: hasImage ? null : theme.colorScheme.primary,
        image: hasImage
            ? DecorationImage(
                image: NetworkImage(section.imageUrl),
                fit: BoxFit.cover,
                colorFilter: ColorFilter.mode(
                  Colors.black.withValues(alpha: 0.4),
                  BlendMode.darken,
                ),
              )
            : null,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (section.title.isNotEmpty)
            Text(
              section.title,
              textAlign: TextAlign.center,
              style: theme.textTheme.headlineMedium?.copyWith(
                color: Colors.white,
                fontWeight: FontWeight.bold,
              ),
            ),
          if (section.subtitle.isNotEmpty)
            Padding(
              padding: const EdgeInsets.only(top: 12),
              child: Text(
                section.subtitle,
                textAlign: TextAlign.center,
                style: theme.textTheme.bodyLarge?.copyWith(color: Colors.white),
              ),
            ),
        ],
      ),
    );
  }
}

class _TextSection extends StatelessWidget {
  final VitrineSection section;
  const _TextSection({required this.section});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Padding(
      padding: AppSpacing.paddingLg,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (section.heading.isNotEmpty)
            Text(
              section.heading,
              style: theme.textTheme.titleLarge?.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
          if (section.body.isNotEmpty)
            Padding(
              padding: const EdgeInsets.only(top: 8),
              child: Text(section.body, style: theme.textTheme.bodyMedium),
            ),
        ],
      ),
    );
  }
}

class _GallerySection extends StatelessWidget {
  final VitrineSection section;
  const _GallerySection({required this.section});

  @override
  Widget build(BuildContext context) {
    final images = section.images;
    if (images.isEmpty) return const SizedBox.shrink();

    final width = MediaQuery.of(context).size.width;
    final crossAxisCount = width >= 900 ? 4 : (width >= 600 ? 3 : 2);

    return Padding(
      padding: AppSpacing.paddingMd,
      child: GridView.builder(
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: crossAxisCount,
          crossAxisSpacing: AppSpacing.sm,
          mainAxisSpacing: AppSpacing.sm,
        ),
        itemCount: images.length,
        itemBuilder: (context, index) {
          return ClipRRect(
            borderRadius: BorderRadius.circular(8),
            child: Image.network(
              images[index],
              fit: BoxFit.cover,
              errorBuilder: (_, __, ___) => Container(
                color: Colors.grey.shade200,
                child: const Icon(Icons.broken_image, color: Colors.grey),
              ),
            ),
          );
        },
      ),
    );
  }
}

class _ServicesSection extends StatelessWidget {
  final List<Service> services;
  final void Function(Service) onServiceTap;
  final String cardStyle;
  final bool showPrices;

  const _ServicesSection({
    required this.services,
    required this.onServiceTap,
    required this.cardStyle,
    required this.showPrices,
  });

  @override
  Widget build(BuildContext context) {
    if (services.isEmpty) return const SizedBox.shrink();

    // Estilo "list": cards horizontais empilhados (1 por linha).
    if (cardStyle == 'list') {
      return Padding(
        padding: AppSpacing.paddingMd,
        child: Column(
          children: [
            for (final service in services) ...[
              AnimatedServiceCard(
                service: service,
                onTap: () => onServiceTap(service),
                cardStyle: cardStyle,
                showPrices: showPrices,
              ),
              SizedBox(height: AppSpacing.sm),
            ],
          ],
        ),
      );
    }

    // Estilos "classic" e "overlay": grid responsivo.
    final width = MediaQuery.of(context).size.width;
    final crossAxisCount = width >= 900 ? 3 : (width >= 600 ? 2 : 1);
    final aspectRatio = cardStyle == 'overlay' ? 0.85 : 0.78;

    return Padding(
      padding: AppSpacing.paddingMd,
      child: GridView.builder(
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: crossAxisCount,
          crossAxisSpacing: AppSpacing.md,
          mainAxisSpacing: AppSpacing.md,
          childAspectRatio: aspectRatio,
        ),
        itemCount: services.length,
        itemBuilder: (context, index) {
          return AnimatedServiceCard(
            service: services[index],
            onTap: () => onServiceTap(services[index]),
            cardStyle: cardStyle,
            showPrices: showPrices,
          );
        },
      ),
    );
  }
}
