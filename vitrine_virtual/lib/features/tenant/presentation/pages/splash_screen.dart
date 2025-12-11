import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../../core/config/app_config.dart';
import '../../../../core/routes/app_routes.dart';
import '../../../../shared/widgets/loading_indicator.dart';
import '../../../../shared/widgets/error_widget.dart';
import '../cubit/tenant_cubit.dart';
import '../cubit/tenant_state.dart';

/// Tela inicial que carrega o tenant baseado no subdomínio.
class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> {
  @override
  void initState() {
    super.initState();
    _loadTenant();
  }

  Future<void> _loadTenant() async {
    final subdomain = AppConfig.extractSubdomain();
    context.read<TenantCubit>().loadTenant(subdomain);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: BlocConsumer<TenantCubit, TenantState>(
        listener: (context, state) {
          if (state is TenantLoaded) {
            Navigator.pushReplacementNamed(
              context,
              AppRoutes.home,
              arguments: {'tenant': state.tenant},
            );
          }
        },
        builder: (context, state) {
          if (state is TenantLoading) {
            return const LoadingIndicator(
              message: 'Carregando informações...',
            );
          }

          if (state is TenantError) {
            return ErrorDisplay(
              message: state.message,
              onRetry: _loadTenant,
            );
          }

          return const LoadingIndicator();
        },
      ),
    );
  }
}
