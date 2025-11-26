import 'dart:developer' as developer;
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../domain/usecases/get_tenant_by_subdomain.dart';
import 'tenant_state.dart';

class TenantCubit extends Cubit<TenantState> {
  final GetTenantBySubdomain getTenantBySubdomain;

  TenantCubit({required this.getTenantBySubdomain})
      : super(const TenantInitial());

  Future<void> loadTenant(String subdomain) async {
    developer.log(
      'Cubit: Iniciando carregamento do tenant - subdomain: $subdomain',
      name: 'TenantCubit',
    );

    emit(const TenantLoading());

    final result = await getTenantBySubdomain(subdomain);

    result.fold(
      (failure) {
        developer.log(
          'Cubit: ERRO ao carregar tenant - ${failure.message}',
          name: 'TenantCubit',
          level: 1000,
        );
        emit(TenantError(failure.message));
      },
      (tenant) {
        developer.log(
          'Cubit: Tenant carregado com sucesso - Nome: ${tenant.name}',
          name: 'TenantCubit',
        );
        emit(TenantLoaded(tenant));
      },
    );
  }

  void reset() {
    emit(const TenantInitial());
  }
}
