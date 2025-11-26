import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'presentation/cubits/tenant/tenant_cubit.dart';
import 'presentation/cubits/tenant/tenant_state.dart';
import 'presentation/widgets/loading_indicator.dart';
import 'presentation/widgets/error_widget.dart';
import 'routes/app_routes.dart';

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
    final subdomain = _extractSubdomain();
    context.read<TenantCubit>().loadTenant(subdomain);
  }

  String _extractSubdomain() {
    final uri = Uri.base;
    final host = uri.host;

    if (host == 'localhost' || host == '127.0.0.1') {
      return 'barbearia-teste';
    }

    final parts = host.split('.');
    if (parts.length >= 3) {
      return parts[0];
    }

    return 'barbearia-teste';
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
