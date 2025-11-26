import 'package:equatable/equatable.dart';
import '../../../data/models/tenant_model.dart';

abstract class TenantState extends Equatable {
  const TenantState();

  @override
  List<Object?> get props => [];
}

class TenantInitial extends TenantState {
  const TenantInitial();
}

class TenantLoading extends TenantState {
  const TenantLoading();
}

class TenantLoaded extends TenantState {
  final TenantModel tenant;

  const TenantLoaded(this.tenant);

  @override
  List<Object?> get props => [tenant];
}

class TenantError extends TenantState {
  final String message;

  const TenantError(this.message);

  @override
  List<Object?> get props => [message];
}
