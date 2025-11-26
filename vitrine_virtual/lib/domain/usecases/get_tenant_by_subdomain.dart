import 'package:dartz/dartz.dart';
import '../../core/errors/failures.dart';
import '../../data/models/tenant_model.dart';
import '../../data/repositories/tenant_repository.dart';

class GetTenantBySubdomain {
  final TenantRepository repository;

  GetTenantBySubdomain({required this.repository});

  Future<Either<Failure, TenantModel>> call(String subdomain) async {
    if (subdomain.trim().isEmpty) {
      return const Left(ValidationFailure('Subdomínio não pode ser vazio'));
    }

    return await repository.getTenantBySubdomain(subdomain);
  }
}
