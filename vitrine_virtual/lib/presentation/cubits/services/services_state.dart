import 'package:equatable/equatable.dart';
import '../../../data/models/service_model.dart';

abstract class ServicesState extends Equatable {
  const ServicesState();

  @override
  List<Object?> get props => [];
}

class ServicesInitial extends ServicesState {
  const ServicesInitial();
}

class ServicesLoading extends ServicesState {
  const ServicesLoading();
}

class ServicesLoaded extends ServicesState {
  final List<ServiceModel> services;

  const ServicesLoaded(this.services);

  @override
  List<Object?> get props => [services];
}

class ServicesError extends ServicesState {
  final String message;

  const ServicesError(this.message);

  @override
  List<Object?> get props => [message];
}
