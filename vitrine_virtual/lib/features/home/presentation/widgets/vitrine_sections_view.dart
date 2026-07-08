import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';

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
      case 'cover':
        return _CoverSection(section: section);
      case 'testimonials':
        return _TestimonialsSection(section: section);
      case 'social':
        return _SocialSection(section: section);
      case 'hours':
        return _HoursSection(section: section);
      case 'address':
        return _AddressSection(section: section);
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

// ===================== HELPERS =====================

Future<void> _openUrl(String url) async {
  if (url.isEmpty) return;
  final uri = Uri.tryParse(url);
  if (uri == null) return;
  await launchUrl(uri, mode: LaunchMode.externalApplication);
}

String _digits(String s) => s.replaceAll(RegExp(r'[^0-9]'), '');

class _SectionHeading extends StatelessWidget {
  final String text;
  const _SectionHeading(this.text);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Text(
        text,
        style: Theme.of(context)
            .textTheme
            .titleLarge
            ?.copyWith(fontWeight: FontWeight.bold),
      ),
    );
  }
}

class _CoverSection extends StatelessWidget {
  final VitrineSection section;
  const _CoverSection({required this.section});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final hasImage = section.imageUrl.isNotEmpty;
    return Container(
      width: double.infinity,
      height: 260,
      alignment: Alignment.center,
      padding: AppSpacing.paddingLg,
      decoration: BoxDecoration(
        color: hasImage ? null : theme.colorScheme.primary,
        image: hasImage
            ? DecorationImage(
                image: NetworkImage(section.imageUrl),
                fit: BoxFit.cover,
                colorFilter: ColorFilter.mode(
                  Colors.black.withValues(alpha: 0.45),
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
              padding: const EdgeInsets.only(top: 8),
              child: Text(
                section.subtitle,
                textAlign: TextAlign.center,
                style: theme.textTheme.bodyLarge?.copyWith(color: Colors.white70),
              ),
            ),
        ],
      ),
    );
  }
}

class _TestimonialsSection extends StatelessWidget {
  final VitrineSection section;
  const _TestimonialsSection({required this.section});

  @override
  Widget build(BuildContext context) {
    final items = section.items;
    if (items.isEmpty) return const SizedBox.shrink();

    return Padding(
      padding: AppSpacing.paddingMd,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const _SectionHeading('Depoimentos'),
          for (final t in items) _testimonialCard(context, t),
        ],
      ),
    );
  }

  Widget _testimonialCard(BuildContext context, Map<String, dynamic> t) {
    final name = (t['name'] ?? '').toString();
    final text = (t['text'] ?? '').toString();
    final rating = (t['rating'] is num) ? (t['rating'] as num).toInt() : 5;

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.06),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: List.generate(
              5,
              (i) => Icon(
                i < rating ? Icons.star : Icons.star_border,
                size: 16,
                color: Colors.amber,
              ),
            ),
          ),
          if (text.isNotEmpty) ...[
            const SizedBox(height: 8),
            Text(
              '"$text"',
              style: TextStyle(
                fontStyle: FontStyle.italic,
                color: Colors.grey.shade700,
              ),
            ),
          ],
          if (name.isNotEmpty) ...[
            const SizedBox(height: 8),
            Text(name, style: const TextStyle(fontWeight: FontWeight.bold)),
          ],
        ],
      ),
    );
  }
}

class _SocialSection extends StatelessWidget {
  final VitrineSection section;
  const _SocialSection({required this.section});

  @override
  Widget build(BuildContext context) {
    final links = <(IconData, String)>[];
    if (section.whatsapp.isNotEmpty) {
      links.add((Icons.chat, 'https://wa.me/${_digits(section.whatsapp)}'));
    }
    if (section.instagram.isNotEmpty) {
      links.add((Icons.camera_alt, _handleUrl(section.instagram, 'instagram.com')));
    }
    if (section.facebook.isNotEmpty) {
      links.add((Icons.facebook, _handleUrl(section.facebook, 'facebook.com')));
    }
    if (section.tiktok.isNotEmpty) {
      links.add((Icons.music_note, _handleUrl(section.tiktok, 'tiktok.com/@')));
    }
    if (links.isEmpty) return const SizedBox.shrink();

    final primary = Theme.of(context).colorScheme.primary;
    return Padding(
      padding: AppSpacing.paddingMd,
      child: Wrap(
        alignment: WrapAlignment.center,
        spacing: 16,
        runSpacing: 16,
        children: [
          for (final l in links)
            InkWell(
              onTap: () => _openUrl(l.$2),
              borderRadius: BorderRadius.circular(28),
              child: Container(
                width: 56,
                height: 56,
                decoration: BoxDecoration(color: primary, shape: BoxShape.circle),
                child: Icon(l.$1, color: Colors.white),
              ),
            ),
        ],
      ),
    );
  }

  String _handleUrl(String value, String base) {
    if (value.startsWith('http')) return value;
    final handle = value.replaceAll('@', '').trim();
    return 'https://$base$handle';
  }
}

class _HoursSection extends StatelessWidget {
  final VitrineSection section;
  const _HoursSection({required this.section});

  @override
  Widget build(BuildContext context) {
    final items = section.items;
    if (items.isEmpty) return const SizedBox.shrink();

    return Padding(
      padding: AppSpacing.paddingMd,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const _SectionHeading('Horário de funcionamento'),
          for (final h in items)
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 6),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    (h['label'] ?? '').toString(),
                    style: TextStyle(color: Colors.grey.shade700),
                  ),
                  Text(
                    (h['value'] ?? '').toString(),
                    style: const TextStyle(fontWeight: FontWeight.bold),
                  ),
                ],
              ),
            ),
        ],
      ),
    );
  }
}

class _AddressSection extends StatelessWidget {
  final VitrineSection section;
  const _AddressSection({required this.section});

  @override
  Widget build(BuildContext context) {
    if (section.address.isEmpty) return const SizedBox.shrink();
    final primary = Theme.of(context).colorScheme.primary;

    return Padding(
      padding: AppSpacing.paddingMd,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const _SectionHeading('Onde estamos'),
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Icon(Icons.location_on, color: primary),
              const SizedBox(width: 8),
              Expanded(child: Text(section.address)),
            ],
          ),
          if (section.mapUrl.isNotEmpty)
            Padding(
              padding: const EdgeInsets.only(top: 12),
              child: OutlinedButton.icon(
                onPressed: () => _openUrl(section.mapUrl),
                icon: const Icon(Icons.map_outlined),
                label: const Text('Ver no mapa'),
              ),
            ),
        ],
      ),
    );
  }
}
