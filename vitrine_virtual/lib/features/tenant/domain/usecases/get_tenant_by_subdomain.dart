import 'package:dartz/dartz.dart';

import '../../../../core/errors/failures.dart';
import '../entities/tenant.dart';
import '../repositories/tenant_repository.dart';

/// Caso de uso para buscar tenant por subdomínio.
///
/// Implementa a regra de negócio de validação do subdomínio
/// antes de delegar a busca para o repositório.
class GetTenantBySubdomain {
  final TenantRepository repository;

  GetTenantBySubdomain({required this.repository});

  /// Executa o caso de uso.
  ///
  /// Valida se o [subdomain] não está vazio antes de buscar.
  /// Retorna [ValidationFailure] se o subdomínio for inválido.
  Future<Either<Failure, Tenant>> call(String subdomain) async {
    final trimmedSubdomain = subdomain.trim().toLowerCase();

    if (trimmedSubdomain.isEmpty) {
      return const Left(ValidationFailure('Subdomínio não pode ser vazio'));
    }

    // Validação de formato do subdomínio
    if (!_isValidSubdomainFormat(trimmedSubdomain)) {
      return const Left(
        ValidationFailure('Subdomínio deve conter apenas letras, números e hífens'),
      );
    }

    return await repository.getTenantBySubdomain(trimmedSubdomain);
  }

  /// Verifica se o formato do subdomínio é válido.
  bool _isValidSubdomainFormat(String subdomain) {
    // Subdomínio deve ter pelo menos 2 caracteres
    if (subdomain.length < 2) return false;
    // Apenas letras, números e hífens, não começando ou terminando com hífen
    return RegExp(r'^[a-z0-9][a-z0-9-]*[a-z0-9]$|^[a-z0-9]$').hasMatch(subdomain);
  }
}
