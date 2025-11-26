import 'package:dartz/dartz.dart';
import '../../core/errors/failures.dart';
import '../datasources/firebase_datasource.dart';
import '../models/service_model.dart';

class ServiceRepository {
  final FirebaseDatasource datasource;

  ServiceRepository({required this.datasource});

  Future<Either<Failure, List<ServiceModel>>> getServicesByTenantId(
    String tenantId,
  ) async {
    try {
      final services = await datasource.getServicesByTenantId(tenantId);
      return Right(services);
    } on Failure catch (failure) {
      return Left(failure);
    } catch (e) {
      return const Left(UnknownFailure('Erro inesperado ao buscar serviços'));
    }
  }

  Future<Either<Failure, ServiceModel>> getServiceById(
    String serviceId,
  ) async {
    try {
      final service = await datasource.getServiceById(serviceId);
      return Right(service);
    } on Failure catch (failure) {
      return Left(failure);
    } catch (e) {
      return const Left(UnknownFailure('Erro inesperado ao buscar serviço'));
    }
  }
}
