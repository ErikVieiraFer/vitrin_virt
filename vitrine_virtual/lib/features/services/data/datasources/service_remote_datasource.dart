import '../models/service_model.dart';

/// Interface abstrata para datasource remoto de Services.
///
/// Define o contrato para operações de dados de serviços.
abstract class ServiceRemoteDatasource {
  /// Busca todos os serviços ativos de um tenant.
  Future<List<ServiceModel>> getServicesByTenantId(String tenantId);

  /// Busca um serviço específico pelo ID.
  ///
  /// Lança [NotFoundFailure] se não encontrado.
  Future<ServiceModel> getServiceById(String serviceId);
}
