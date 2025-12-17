import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../../core/utils/app_logger.dart';
import '../../domain/usecases/get_tenant_by_subdomain.dart';
import 'tenant_state.dart';

/// Cubit responsável por gerenciar o estado do Tenant.
///
/// Carrega as informações do tenant baseado no subdomínio
/// e mantém o estado disponível para toda a aplicação.
class TenantCubit extends Cubit<TenantState> {
  final GetTenantBySubdomain getTenantBySubdomain;

  TenantCubit({required this.getTenantBySubdomain})
      : super(const TenantInitial());

  /// Carrega o tenant pelo subdomínio.
  Future<void> loadTenant(String subdomain) async {
    AppLogger.state('TenantCubit', 'Loading', extra: 'subdomain: $subdomain');

    emit(const TenantLoading());

    final result = await getTenantBySubdomain(subdomain);

    result.fold(
      (failure) {
        AppLogger.error(
          'Erro ao carregar tenant',
          tag: 'TenantCubit',
          error: failure.message,
        );
        emit(TenantError(failure.message));
      },
      (tenant) {
        AppLogger.state('TenantCubit', 'Loaded', extra: 'Nome: ${tenant.name}');
        emit(TenantLoaded(tenant));
      },
    );
  }

  /// Reseta o estado para inicial.
  void reset() {
    emit(const TenantInitial());
  }
}
