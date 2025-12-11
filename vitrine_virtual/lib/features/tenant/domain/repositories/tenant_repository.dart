import 'package:dartz/dartz.dart';

import '../../../../core/errors/failures.dart';
import '../entities/tenant.dart';

/// Interface abstrata para o repositório de Tenant.
///
/// Define o contrato que a camada de dados deve implementar.
/// Isso permite inversão de dependência (DIP) - domain não depende de data.
/// Retorna [Tenant] entity, não model, para isolar a camada de domínio.
abstract class TenantRepository {
  /// Busca um tenant pelo subdomínio.
  ///
  /// Retorna [Right] com [Tenant] entity se encontrado.
  /// Retorna [Left] com [Failure] em caso de erro.
  Future<Either<Failure, Tenant>> getTenantBySubdomain(String subdomain);
}
