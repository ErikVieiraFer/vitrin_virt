import 'package:equatable/equatable.dart';

import '../../domain/entities/service.dart';

/// Estados possíveis do ServicesCubit.
abstract class ServicesState extends Equatable {
  const ServicesState();

  @override
  List<Object?> get props => [];
}

/// Estado inicial.
class ServicesInitial extends ServicesState {
  const ServicesInitial();
}

/// Estado de carregamento.
class ServicesLoading extends ServicesState {
  const ServicesLoading();
}

/// Estado de sucesso - serviços carregados.
class ServicesLoaded extends ServicesState {
  final List<Service> services;

  const ServicesLoaded(this.services);

  @override
  List<Object?> get props => [services];
}

/// Estado de erro.
class ServicesError extends ServicesState {
  final String message;

  const ServicesError(this.message);

  @override
  List<Object?> get props => [message];
}
