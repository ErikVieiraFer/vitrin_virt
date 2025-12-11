import 'package:get_it/get_it.dart';
import 'package:cloud_firestore/cloud_firestore.dart';

// Feature: Tenant
import '../../features/tenant/data/datasources/tenant_remote_datasource.dart';
import '../../features/tenant/data/datasources/tenant_remote_datasource_impl.dart';
import '../../features/tenant/data/repositories/tenant_repository_impl.dart';
import '../../features/tenant/domain/repositories/tenant_repository.dart';
import '../../features/tenant/domain/usecases/get_tenant_by_subdomain.dart';
import '../../features/tenant/presentation/cubit/tenant_cubit.dart';

// Feature: Services
import '../../features/services/data/datasources/service_remote_datasource.dart';
import '../../features/services/data/datasources/service_remote_datasource_impl.dart';
import '../../features/services/data/repositories/service_repository_impl.dart';
import '../../features/services/domain/repositories/service_repository.dart';
import '../../features/services/domain/usecases/get_services_by_tenant.dart';
import '../../features/services/presentation/cubit/services_cubit.dart';

// Feature: Booking
import '../../features/booking/data/datasources/booking_remote_datasource.dart';
import '../../features/booking/data/datasources/booking_remote_datasource_impl.dart';
import '../../features/booking/data/repositories/availability_repository_impl.dart';
import '../../features/booking/data/repositories/booking_repository_impl.dart';
import '../../features/booking/domain/repositories/availability_repository.dart';
import '../../features/booking/domain/repositories/booking_repository.dart';
import '../../features/booking/domain/usecases/get_available_slots.dart';
import '../../features/booking/domain/usecases/create_booking.dart';
import '../../features/booking/presentation/cubit/booking_cubit.dart';

final sl = GetIt.instance;

/// Configura todas as dependências da aplicação.
///
/// Segue a ordem: External -> Data Sources -> Repositories -> Use Cases -> Cubits
Future<void> configureDependencies() async {
  // ==================== External ====================
  sl.registerLazySingleton<FirebaseFirestore>(
    () => FirebaseFirestore.instance,
  );

  // ==================== Data Sources ====================
  // Cada datasource é responsável por uma feature específica (SRP)
  // Registrados como interfaces para permitir substituição (DIP)

  // Tenant Datasource
  sl.registerLazySingleton<TenantRemoteDatasource>(
    () => TenantRemoteDatasourceImpl(firestore: sl()),
  );

  // Service Datasource
  sl.registerLazySingleton<ServiceRemoteDatasource>(
    () => ServiceRemoteDatasourceImpl(firestore: sl()),
  );

  // Booking Datasource (inclui availability)
  sl.registerLazySingleton<BookingRemoteDatasource>(
    () => BookingRemoteDatasourceImpl(firestore: sl()),
  );

  // ==================== Repositories ====================
  // Repositories dependem de interfaces de datasource (DIP)

  // Tenant
  sl.registerLazySingleton<TenantRepository>(
    () => TenantRepositoryImpl(remoteDatasource: sl()),
  );

  // Services
  sl.registerLazySingleton<ServiceRepository>(
    () => ServiceRepositoryImpl(remoteDatasource: sl()),
  );

  // Booking
  sl.registerLazySingleton<AvailabilityRepository>(
    () => AvailabilityRepositoryImpl(remoteDatasource: sl()),
  );

  sl.registerLazySingleton<BookingRepository>(
    () => BookingRepositoryImpl(remoteDatasource: sl()),
  );

  // ==================== Use Cases ====================
  // Use cases dependem de interfaces de repository (DIP)

  // Tenant
  sl.registerLazySingleton(
    () => GetTenantBySubdomain(repository: sl()),
  );

  // Services
  sl.registerLazySingleton(
    () => GetServicesByTenant(repository: sl()),
  );

  // Booking
  sl.registerLazySingleton(
    () => GetAvailableSlots(repository: sl()),
  );

  sl.registerLazySingleton(
    () => CreateBooking(repository: sl()),
  );

  // ==================== Cubits ====================
  // Factory: nova instância a cada chamada (para não compartilhar estado)

  sl.registerFactory(
    () => TenantCubit(getTenantBySubdomain: sl()),
  );

  sl.registerFactory(
    () => ServicesCubit(getServicesByTenant: sl()),
  );

  sl.registerFactory(
    () => BookingCubit(
      getAvailableSlots: sl(),
      createBooking: sl(),
    ),
  );
}

/// Reseta todas as dependências (útil para testes).
Future<void> resetDependencies() async {
  await sl.reset();
}
