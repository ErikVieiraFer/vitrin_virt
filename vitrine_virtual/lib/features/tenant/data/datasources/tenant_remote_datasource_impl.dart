import 'package:cloud_firestore/cloud_firestore.dart';
import '../../../../core/constants/firebase_constants.dart';
import '../../../../core/errors/failures.dart';
import '../../../../shared/data/datasources/base_firebase_datasource.dart';
import '../models/tenant_model.dart';
import 'tenant_remote_datasource.dart';

/// Implementação Firebase do [TenantRemoteDatasource].
class TenantRemoteDatasourceImpl extends BaseFirebaseDatasource
    implements TenantRemoteDatasource {
  TenantRemoteDatasourceImpl({required super.firestore});

  @override
  Future<TenantModel> getTenantBySubdomain(String subdomain) async {
    try {
      logInfo('getTenantBySubdomain', 'Buscando tenant com subdomain: $subdomain');

      final querySnapshot = await firestore
          .collection(FirebaseConstants.tenantsCollection)
          .where(FirebaseConstants.subdomainField, isEqualTo: subdomain)
          .limit(1)
          .get();

      logInfo('getTenantBySubdomain', 'Documentos encontrados: ${querySnapshot.docs.length}');

      if (querySnapshot.docs.isEmpty) {
        logError(
          'getTenantBySubdomain',
          'Tenant não encontrado para subdomain: $subdomain',
        );
        throw const NotFoundFailure('Tenant não encontrado');
      }

      final doc = querySnapshot.docs.first;
      logInfo('getTenantBySubdomain', 'Tenant encontrado: ID=${doc.id}');

      return TenantModel.fromJson(doc.data(), doc.id);
    } on FirebaseException catch (e) {
      logFirebaseError('getTenantBySubdomain', e);
      throw ServerFailure(e.message ?? 'Erro ao buscar tenant');
    } on Failure {
      rethrow;
    } catch (e, stackTrace) {
      logError('getTenantBySubdomain', 'ERRO INESPERADO: $e', e, stackTrace);
      rethrow;
    }
  }

  @override
  Future<TenantModel> getTenantById(String tenantId) async {
    try {
      logInfo('getTenantById', 'Buscando tenant com ID: $tenantId');

      final doc = await firestore
          .collection(FirebaseConstants.tenantsCollection)
          .doc(tenantId)
          .get();

      if (!doc.exists) {
        throw const NotFoundFailure('Tenant não encontrado');
      }

      return TenantModel.fromJson(doc.data()!, doc.id);
    } on FirebaseException catch (e) {
      logFirebaseError('getTenantById', e);
      throw ServerFailure(e.message ?? 'Erro ao buscar tenant');
    } on Failure {
      rethrow;
    }
  }
}
