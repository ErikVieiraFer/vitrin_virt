import '../models/tenant_model.dart';

/// Interface abstrata para datasource remoto de Tenant.
///
/// Define o contrato para operações de dados do Tenant.
/// Permite substituir a implementação (ex: Firebase -> API REST).
abstract class TenantRemoteDatasource {
  /// Busca tenant pelo subdomínio.
  ///
  /// Lança [NotFoundFailure] se não encontrado.
  /// Lança [ServerFailure] em caso de erro de servidor.
  Future<TenantModel> getTenantBySubdomain(String subdomain);

  /// Busca tenant pelo ID.
  Future<TenantModel> getTenantById(String tenantId);
}
