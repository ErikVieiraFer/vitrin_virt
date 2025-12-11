import 'package:dartz/dartz.dart';

import '../../../../core/errors/failures.dart';
import '../entities/service.dart';
import '../repositories/service_repository.dart';

/// Caso de uso para buscar serviços de um tenant.
class GetServicesByTenant {
  final ServiceRepository repository;

  GetServicesByTenant({required this.repository});

  /// Executa o caso de uso.
  ///
  /// Valida se o [tenantId] não está vazio antes de buscar.
  /// Retorna apenas serviços ativos por padrão.
  Future<Either<Failure, List<Service>>> call(
    String tenantId, {
    bool onlyActive = true,
  }) async {
    final trimmedTenantId = tenantId.trim();

    if (trimmedTenantId.isEmpty) {
      return const Left(ValidationFailure('ID do tenant não pode ser vazio'));
    }

    final result = await repository.getServicesByTenantId(trimmedTenantId);

    // Filtra apenas serviços ativos se solicitado
    return result.map((services) {
      if (onlyActive) {
        return services.where((service) => service.isActive).toList();
      }
      return services;
    });
  }
}
