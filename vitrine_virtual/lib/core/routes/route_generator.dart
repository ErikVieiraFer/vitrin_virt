import 'package:flutter/material.dart';

import '../../features/booking/presentation/pages/booking_screen.dart';
import '../../features/booking/presentation/pages/confirmation_screen.dart';
import '../../features/booking/presentation/pages/service_detail_screen.dart';
import '../../features/home/presentation/pages/home_screen.dart';
import '../../features/services/domain/entities/service.dart';
import '../../features/tenant/domain/entities/tenant.dart';
import '../../features/tenant/presentation/pages/splash_screen.dart';
import 'app_routes.dart';

/// Gerador de rotas da aplicação.
class RouteGenerator {
  RouteGenerator._();

  static Route<dynamic> generateRoute(RouteSettings settings) {
    final args = settings.arguments as Map<String, dynamic>?;

    switch (settings.name) {
      case AppRoutes.splash:
        return MaterialPageRoute(
          builder: (_) => const SplashScreen(),
          settings: settings,
        );

      case AppRoutes.home:
        if (args != null && args['tenant'] is Tenant) {
          return MaterialPageRoute(
            builder: (_) => HomeScreen(tenant: args['tenant'] as Tenant),
            settings: settings,
          );
        }
        return _errorRoute('Tenant não fornecido');

      case AppRoutes.serviceDetail:
        if (args != null &&
            args['service'] is Service &&
            args['tenant'] is Tenant) {
          return MaterialPageRoute(
            builder: (_) => ServiceDetailScreen(
              service: args['service'] as Service,
              tenant: args['tenant'] as Tenant,
            ),
            settings: settings,
          );
        }
        return _errorRoute('Dados do serviço não fornecidos');

      case AppRoutes.booking:
        if (args != null &&
            args['service'] is Service &&
            args['tenant'] is Tenant) {
          return MaterialPageRoute(
            builder: (_) => BookingScreen(
              service: args['service'] as Service,
              tenant: args['tenant'] as Tenant,
            ),
            settings: settings,
          );
        }
        return _errorRoute('Dados do agendamento não fornecidos');

      case AppRoutes.confirmation:
        if (args != null &&
            args['bookingId'] is String &&
            args['service'] is Service &&
            args['tenant'] is Tenant &&
            args['date'] is DateTime &&
            args['time'] is String &&
            args['customerName'] is String) {
          return MaterialPageRoute(
            builder: (_) => ConfirmationScreen(
              bookingId: args['bookingId'] as String,
              service: args['service'] as Service,
              tenant: args['tenant'] as Tenant,
              date: args['date'] as DateTime,
              time: args['time'] as String,
              customerName: args['customerName'] as String,
            ),
            settings: settings,
          );
        }
        return _errorRoute('Dados da confirmação não fornecidos');

      default:
        return _errorRoute('Rota não encontrada: ${settings.name}');
    }
  }

  static Route<dynamic> _errorRoute(String message) {
    return MaterialPageRoute(
      builder: (_) => Scaffold(
        appBar: AppBar(title: const Text('Erro')),
        body: Center(
          child: Padding(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(Icons.error_outline, size: 64, color: Colors.red),
                const SizedBox(height: 16),
                Text(
                  message,
                  textAlign: TextAlign.center,
                  style: const TextStyle(fontSize: 16),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
