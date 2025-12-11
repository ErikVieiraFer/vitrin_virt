import 'dart:developer' as developer;

import 'package:dartz/dartz.dart';

import '../../../../core/errors/failures.dart';
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
      developer.log(
        'Repository: Buscando tenant para subdomain: $subdomain',
        name: 'TenantRepository',
      );

      final tenantModel = await remoteDatasource.getTenantBySubdomain(subdomain);

      developer.log(
        'Repository: Tenant carregado com sucesso - ID: ${tenantModel.id}',
        name: 'TenantRepository',
      );

      // Converte Model para Entity
      return Right(tenantModel.toEntity());
    } on Failure catch (failure) {
      developer.log(
        'Repository: Failure capturado - ${failure.message}',
        name: 'TenantRepository',
        level: 1000,
      );
      return Left(failure);
    } catch (e, stackTrace) {
      developer.log(
        'Repository: ERRO INESPERADO - $e',
        name: 'TenantRepository',
        error: e,
        stackTrace: stackTrace,
        level: 1000,
      );
      return const Left(UnknownFailure('Erro inesperado ao buscar tenant'));
    }
  }
}
