import 'package:dartz/dartz.dart';
import '../../core/errors/failures.dart';
import '../../data/models/service_model.dart';
import '../../data/repositories/service_repository.dart';

class GetServicesByTenant {
  final ServiceRepository repository;

  GetServicesByTenant({required this.repository});

  Future<Either<Failure, List<ServiceModel>>> call(String tenantId) async {
    if (tenantId.trim().isEmpty) {
      return const Left(ValidationFailure('ID do tenant não pode ser vazio'));
    }

    return await repository.getServicesByTenantId(tenantId);
  }
}
