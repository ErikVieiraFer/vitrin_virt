import 'package:dartz/dartz.dart';

import '../../../../core/errors/failures.dart';
import '../../../../core/utils/app_logger.dart';
import '../../domain/entities/tenant.dart';
import '../../domain/repositories/tenant_repository.dart';
import '../datasources/tenant_remote_datasource.dart';

/// Implementação concreta do [TenantRepository].
///
/// Utiliza [TenantRemoteDatasource] (interface) para buscar dados.
/// Converte Models para Entities antes de retornar.
class TenantRepositoryImpl implements TenantRepository {
  final TenantRemoteDatasource remoteDatasource;

  TenantRepositoryImpl({required this.remoteDatasource});

  @override
  Future<Either<Failure, Tenant>> getTenantBySubdomain(
    String subdomain,
  ) async {
    try {
      AppLogger.info(
        'Buscando tenant para subdomain: $subdomain',
        tag: 'TenantRepository',
      );

      final tenantModel = await remoteDatasource.getTenantBySubdomain(subdomain);

      AppLogger.info(
        'Tenant carregado com sucesso - ID: ${tenantModel.id}',
        tag: 'TenantRepository',
      );

      // Converte Model para Entity
      return Right(tenantModel.toEntity());
    } on Failure catch (failure) {
      AppLogger.warning(
        'Failure capturado - ${failure.message}',
        tag: 'TenantRepository',
      );
      return Left(failure);
    } catch (e, stackTrace) {
      AppLogger.error(
        'Erro inesperado ao buscar tenant',
        tag: 'TenantRepository',
        error: e,
        stackTrace: stackTrace,
      );
      return const Left(UnknownFailure('Erro inesperado ao buscar tenant'));
    }
  }
}
