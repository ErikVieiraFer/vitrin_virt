import 'package:flutter/material.dart';

import '../../core/theme/app_colors.dart';
import '../../core/theme/app_spacing.dart';

/// Widget para exibir estado vazio com ícone, título e descrição.
///
/// Usado quando não há dados para exibir em uma lista ou tela.
class EmptyState extends StatelessWidget {
  final IconData icon;
  final String title;
  final String? description;
  final String? actionLabel;
  final VoidCallback? onAction;

  const EmptyState({
    super.key,
    required this.icon,
    required this.title,
    this.description,
    this.actionLabel,
    this.onAction,
  });

  /// Estado vazio para listas sem itens.
  const EmptyState.noItems({
    super.key,
    this.title = 'Nenhum item encontrado',
    this.description,
    this.actionLabel,
    this.onAction,
  }) : icon = Icons.inbox_outlined;

  /// Estado vazio para horários indisponíveis.
  const EmptyState.noSlots({
    super.key,
    this.title = 'Nenhum horário disponível',
    this.description = 'Selecione outra data',
    this.actionLabel,
    this.onAction,
  }) : icon = Icons.event_busy;

  /// Estado vazio para serviços.
  const EmptyState.noServices({
    super.key,
    this.title = 'Nenhum serviço disponível',
    this.description = 'Volte mais tarde',
    this.actionLabel,
    this.onAction,
  }) : icon = Icons.design_services_outlined;

  /// Estado vazio para busca sem resultados.
  const EmptyState.noResults({
    super.key,
    this.title = 'Nenhum resultado encontrado',
    this.description = 'Tente ajustar sua busca',
    this.actionLabel,
    this.onAction,
  }) : icon = Icons.search_off;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: AppSpacing.paddingLg,
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              icon,
              size: AppSpacing.iconXxl,
              color: AppColors.textSecondary,
            ),
            AppSpacing.verticalMd,
            Text(
              title,
              style: Theme.of(context).textTheme.titleMedium,
              textAlign: TextAlign.center,
            ),
            if (description != null) ...[
              AppSpacing.verticalSm,
              Text(
                description!,
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      color: AppColors.textSecondary,
                    ),
                textAlign: TextAlign.center,
              ),
            ],
            if (actionLabel != null && onAction != null) ...[
              AppSpacing.verticalLg,
              TextButton.icon(
                onPressed: onAction,
                icon: const Icon(Icons.refresh),
                label: Text(actionLabel!),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
