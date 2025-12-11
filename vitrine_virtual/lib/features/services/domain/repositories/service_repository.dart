import 'package:dartz/dartz.dart';

import '../../../../core/errors/failures.dart';
import '../entities/service.dart';

/// Interface abstrata para o repositório de Services.
///
/// Retorna [Service] entity, não model, para isolar a camada de domínio.
abstract class ServiceRepository {
  /// Busca todos os serviços de um tenant.
  ///
  /// Retorna [Right] com lista de [Service] entities.
  /// Retorna [Left] com [Failure] em caso de erro.
  Future<Either<Failure, List<Service>>> getServicesByTenantId(String tenantId);

  /// Busca um serviço específico pelo ID.
  ///
  /// Retorna [Right] com [Service] entity se encontrado.
  /// Retorna [Left] com [Failure] em caso de erro.
  Future<Either<Failure, Service>> getServiceById(String serviceId);
}
