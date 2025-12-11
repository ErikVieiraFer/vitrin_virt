import 'package:dartz/dartz.dart';

import '../../../../core/errors/failures.dart';
import '../../domain/entities/service.dart';
import '../../domain/repositories/service_repository.dart';
import '../datasources/service_remote_datasource.dart';

/// Implementação concreta do [ServiceRepository].
///
/// Utiliza [ServiceRemoteDatasource] (interface) para buscar dados.
/// Converte Models para Entities antes de retornar.
class ServiceRepositoryImpl implements ServiceRepository {
  final ServiceRemoteDatasource remoteDatasource;

  ServiceRepositoryImpl({required this.remoteDatasource});

  @override
  Future<Either<Failure, List<Service>>> getServicesByTenantId(
    String tenantId,
  ) async {
    try {
      final serviceModels =
          await remoteDatasource.getServicesByTenantId(tenantId);

      // Converte lista de Models para lista de Entities
      final services = serviceModels.map((model) => model.toEntity()).toList();

      return Right(services);
    } on Failure catch (failure) {
      return Left(failure);
    } catch (e) {
      return const Left(UnknownFailure('Erro inesperado ao buscar serviços'));
    }
  }

  @override
  Future<Either<Failure, Service>> getServiceById(
    String serviceId,
  ) async {
    try {
      final serviceModel = await remoteDatasource.getServiceById(serviceId);

      // Converte Model para Entity
      return Right(serviceModel.toEntity());
    } on Failure catch (failure) {
      return Left(failure);
    } catch (e) {
      return const Left(UnknownFailure('Erro inesperado ao buscar serviço'));
    }
  }
}
