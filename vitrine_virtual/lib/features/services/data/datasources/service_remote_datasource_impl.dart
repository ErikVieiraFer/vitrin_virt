import 'package:cloud_firestore/cloud_firestore.dart';
import '../../../../core/constants/firebase_constants.dart';
import '../../../../core/errors/failures.dart';
import '../../../../shared/data/datasources/base_firebase_datasource.dart';
import '../models/service_model.dart';
import 'service_remote_datasource.dart';

/// Implementação Firebase do [ServiceRemoteDatasource].
class ServiceRemoteDatasourceImpl extends BaseFirebaseDatasource
    implements ServiceRemoteDatasource {
  ServiceRemoteDatasourceImpl({required super.firestore});

  @override
  Future<List<ServiceModel>> getServicesByTenantId(String tenantId) async {
    try {
      logInfo('getServicesByTenantId', 'Buscando serviços para tenant: $tenantId');

      final querySnapshot = await firestore
          .collection(FirebaseConstants.servicesCollection)
          .where(FirebaseConstants.tenantIdField, isEqualTo: tenantId)
          .orderBy(FirebaseConstants.createdAtField, descending: false)
          .get();

      logInfo(
        'getServicesByTenantId',
        'Serviços encontrados: ${querySnapshot.docs.length}',
      );

      return querySnapshot.docs
          .map((doc) => ServiceModel.fromJson(doc.data(), doc.id))
          .toList();
    } on FirebaseException catch (e) {
      logFirebaseError('getServicesByTenantId', e);
      throw ServerFailure(e.message ?? 'Erro ao buscar serviços');
    }
  }

  @override
  Future<ServiceModel> getServiceById(String serviceId) async {
    try {
      logInfo('getServiceById', 'Buscando serviço com ID: $serviceId');

      final doc = await firestore
          .collection(FirebaseConstants.servicesCollection)
          .doc(serviceId)
          .get();

      if (!doc.exists) {
        throw const NotFoundFailure('Serviço não encontrado');
      }

      return ServiceModel.fromJson(doc.data()!, doc.id);
    } on FirebaseException catch (e) {
      logFirebaseError('getServiceById', e);
      throw ServerFailure(e.message ?? 'Erro ao buscar serviço');
    } on Failure {
      rethrow;
    }
  }
}
