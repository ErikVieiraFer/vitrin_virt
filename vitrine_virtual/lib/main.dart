import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:intl/date_symbol_data_local.dart';

import 'core/config/firebase_config.dart';
import 'core/di/injection.dart';
import 'core/routes/app_routes.dart';
import 'core/routes/route_generator.dart';
import 'core/theme/theme_config.dart';
import 'features/booking/presentation/cubit/booking_cubit.dart';
import 'features/services/presentation/cubit/services_cubit.dart';
import 'features/tenant/presentation/cubit/tenant_cubit.dart';
import 'features/tenant/presentation/cubit/tenant_state.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Inicializa Firebase
  await Firebase.initializeApp(
    options: FirebaseConfig.getOptions(),
  );

  // Inicializa formatação de data para pt_BR
  await initializeDateFormatting('pt_BR', null);

  // Configura injeção de dependências
  await configureDependencies();

  runApp(const VitrinaVirtualApp());
}

/// Aplicação principal.
///
/// Usa GetIt para injeção de dependências dos Cubits.
class VitrinaVirtualApp extends StatelessWidget {
  const VitrinaVirtualApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiBlocProvider(
      providers: [
        BlocProvider<TenantCubit>(
          create: (_) => sl<TenantCubit>(),
        ),
        BlocProvider<ServicesCubit>(
          create: (_) => sl<ServicesCubit>(),
        ),
        BlocProvider<BookingCubit>(
          create: (_) => sl<BookingCubit>(),
        ),
      ],
      child: const AppView(),
    );
  }
}

/// View principal que escuta mudanças do tema.
class AppView extends StatelessWidget {
  const AppView({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<TenantCubit, TenantState>(
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

  /// Constrói o tema baseado no estado do tenant.
  ThemeData _buildThemeFromState(TenantState tenantState) {
    if (tenantState is TenantLoaded) {
      try {
        final themeSettings = tenantState.tenant.themeSettings;

        return ThemeConfig.buildTheme(
          primaryColor: themeSettings.primaryColor.toColor(),
          secondaryColor: themeSettings.secondaryColor.toColor(),
          fontFamily: themeSettings.fontFamily,
        );
      } catch (e) {
        return ThemeConfig.defaultTheme;
      }
    }

    return ThemeConfig.defaultTheme;
  }
}
