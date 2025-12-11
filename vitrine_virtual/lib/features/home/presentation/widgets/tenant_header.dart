import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';

import '../../../../core/constants/app_constants.dart';
import '../../../../core/theme/app_spacing.dart';
import '../../../tenant/domain/entities/tenant.dart';

/// Header que exibe logo e nome do tenant.
class TenantHeader extends StatelessWidget {
  final Tenant tenant;

  const TenantHeader({super.key, required this.tenant});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: AppSpacing.paddingLg,
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.primary,
        boxShadow: const [
          BoxShadow(
            color: Color.fromRGBO(0, 0, 0, 0.1),
            blurRadius: AppSpacing.sm,
            offset: Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        children: [
          ClipRRect(
            borderRadius: AppSpacing.borderRadiusMd,
            child: CachedNetworkImage(
              imageUrl: tenant.logoUrl,
              width: AppConstants.logoSize,
              height: AppConstants.logoSize,
              fit: BoxFit.cover,
              placeholder: (context, url) => Container(
                width: AppConstants.logoSize,
                height: AppConstants.logoSize,
                color: Colors.white.withValues(alpha: 0.2),
                child: const Center(
                  child: CircularProgressIndicator(
                    valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                  ),
                ),
              ),
              errorWidget: (context, url, error) => Container(
                width: AppConstants.logoSize,
                height: AppConstants.logoSize,
                color: Colors.white.withValues(alpha: 0.2),
                child: const Icon(
                  Icons.business,
                  size: AppConstants.placeholderIconSize,
                  color: Colors.white,
                ),
              ),
            ),
          ),
          AppSpacing.verticalMd,
          Text(
            tenant.name,
            style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                  color: Colors.white,
                  fontWeight: FontWeight.bold,
                ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }
}
