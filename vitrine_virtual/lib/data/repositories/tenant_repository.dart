import 'dart:developer' as developer;
import 'package:dartz/dartz.dart';
import '../../core/errors/failures.dart';
import '../datasources/firebase_datasource.dart';
import '../models/tenant_model.dart';

class TenantRepository {
  final FirebaseDatasource datasource;

  TenantRepository({required this.datasource});

  Future<Either<Failure, TenantModel>> getTenantBySubdomain(
    String subdomain,
  ) async {
    try {
      developer.log(
        'Repository: Buscando tenant para subdomain: $subdomain',
        name: 'TenantRepository',
      );

      final tenant = await datasource.getTenantBySubdomain(subdomain);

      developer.log(
        'Repository: Tenant carregado com sucesso - ID: ${tenant.id}',
        name: 'TenantRepository',
      );

      return Right(tenant);
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
