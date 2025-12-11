import 'package:equatable/equatable.dart';

import '../../domain/entities/tenant.dart';

/// Estados possíveis do TenantCubit.
abstract class TenantState extends Equatable {
  const TenantState();

  @override
  List<Object?> get props => [];
}

/// Estado inicial - nenhum tenant carregado.
class TenantInitial extends TenantState {
  const TenantInitial();
}

/// Estado de carregamento.
class TenantLoading extends TenantState {
  const TenantLoading();
}

/// Estado de sucesso - tenant carregado.
class TenantLoaded extends TenantState {
  final Tenant tenant;

  const TenantLoaded(this.tenant);

  @override
  List<Object?> get props => [tenant];
}

/// Estado de erro.
class TenantError extends TenantState {
  final String message;

  const TenantError(this.message);

  @override
  List<Object?> get props => [message];
}
