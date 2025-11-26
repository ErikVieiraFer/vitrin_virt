import 'package:flutter/material.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:intl/date_symbol_data_local.dart';
import 'core/config/firebase_config.dart';
import 'core/theme/theme_config.dart';
import 'core/theme/app_colors.dart';
import 'data/datasources/firebase_datasource.dart';
import 'data/repositories/tenant_repository.dart';
import 'data/repositories/service_repository.dart';
import 'data/repositories/availability_repository.dart';
import 'data/repositories/booking_repository.dart';
import 'domain/usecases/get_tenant_by_subdomain.dart';
import 'domain/usecases/get_services_by_tenant.dart';
import 'domain/usecases/get_available_slots.dart';
import 'domain/usecases/create_booking.dart';
import 'presentation/cubits/tenant/tenant_cubit.dart';
import 'presentation/cubits/services/services_cubit.dart';
import 'presentation/cubits/booking/booking_cubit.dart';
import 'routes/route_generator.dart';
import 'routes/app_routes.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  await Firebase.initializeApp(
    options: FirebaseConfig.getOptions(),
  );

  await initializeDateFormatting('pt_BR', null);

  runApp(const VitrinaVirtualApp());
}

class VitrinaVirtualApp extends StatelessWidget {
  const VitrinaVirtualApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiRepositoryProvider(
      providers: [
        RepositoryProvider<FirebaseDatasource>(
          create: (_) =>
              FirebaseDatasource(firestore: FirebaseFirestore.instance),
        ),
        RepositoryProvider<TenantRepository>(
          create: (context) =>
              TenantRepository(datasource: context.read<FirebaseDatasource>()),
        ),
        RepositoryProvider<ServiceRepository>(
          create: (context) =>
              ServiceRepository(datasource: context.read<FirebaseDatasource>()),
        ),
        RepositoryProvider<AvailabilityRepository>(
          create: (context) => AvailabilityRepository(
            datasource: context.read<FirebaseDatasource>(),
          ),
        ),
        RepositoryProvider<BookingRepository>(
          create: (context) =>
              BookingRepository(datasource: context.read<FirebaseDatasource>()),
        ),
      ],
      child: MultiBlocProvider(
        providers: [
          BlocProvider<TenantCubit>(
            create: (context) => TenantCubit(
              getTenantBySubdomain: GetTenantBySubdomain(
                repository: context.read<TenantRepository>(),
              ),
            ),
          ),
          BlocProvider<ServicesCubit>(
            create: (context) => ServicesCubit(
              getServicesByTenant: GetServicesByTenant(
                repository: context.read<ServiceRepository>(),
              ),
            ),
          ),
          BlocProvider<BookingCubit>(
            create: (context) => BookingCubit(
              getAvailableSlots: GetAvailableSlots(
                repository: context.read<AvailabilityRepository>(),
              ),
              createBooking: CreateBooking(
                repository: context.read<BookingRepository>(),
              ),
            ),
          ),
        ],
        child: const AppView(),
      ),
    );
  }
}

class AppView extends StatelessWidget {
  const AppView({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<TenantCubit, dynamic>(
      builder: (context, tenantState) {
        final theme = _buildThemeFromState(tenantState);

        return MaterialApp(
          title: 'Vitrina Virtual',
          debugShowCheckedModeBanner: false,
          theme: theme,
          initialRoute: AppRoutes.splash,
          onGenerateRoute: RouteGenerator.generateRoute,
          builder: (context, child) {
            return child ?? const SizedBox.shrink();
          },
        );
      },
    );
  }

  ThemeData _buildThemeFromState(dynamic tenantState) {
    if (tenantState.toString().contains('TenantLoaded')) {
      try {
        final tenant = (tenantState as dynamic).tenant;
        final themeSettings = tenant.themeSettings;

        return ThemeConfig.buildTheme(
          primaryColor: AppColors.fromHex(themeSettings.primaryColor),
          secondaryColor: AppColors.fromHex(themeSettings.secondaryColor),
          fontFamily: themeSettings.fontFamily,
        );
      } catch (e) {
        return ThemeConfig.defaultTheme;
      }
    }

    return ThemeConfig.defaultTheme;
  }
}
