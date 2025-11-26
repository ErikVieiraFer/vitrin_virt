import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../domain/usecases/get_services_by_tenant.dart';
import 'services_state.dart';

class ServicesCubit extends Cubit<ServicesState> {
  final GetServicesByTenant getServicesByTenant;

  ServicesCubit({required this.getServicesByTenant})
      : super(const ServicesInitial());

  Future<void> loadServices(String tenantId) async {
    emit(const ServicesLoading());

    final result = await getServicesByTenant(tenantId);

    result.fold(
      (failure) => emit(ServicesError(failure.message)),
      (services) => emit(ServicesLoaded(services)),
    );
  }

  void reset() {
    emit(const ServicesInitial());
  }
}
