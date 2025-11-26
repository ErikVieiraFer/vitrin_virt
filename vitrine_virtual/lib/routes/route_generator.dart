import 'package:flutter/material.dart';
import '../data/models/service_model.dart';
import '../data/models/tenant_model.dart';
import '../splash_screen.dart';
import '../presentation/screens/home/home_screen.dart';
import '../presentation/screens/service_detail/service_detail_screen.dart';
import '../presentation/screens/booking/booking_screen.dart';
import '../presentation/screens/confirmation/confirmation_screen.dart';
import 'app_routes.dart';

class RouteGenerator {
  static Route<dynamic> generateRoute(RouteSettings settings) {
    final args = settings.arguments as Map<String, dynamic>?;

    switch (settings.name) {
      case AppRoutes.splash:
        return MaterialPageRoute(
          builder: (_) => const SplashScreen(),
          settings: settings,
        );

      case AppRoutes.home:
        if (args != null && args['tenant'] is TenantModel) {
          return MaterialPageRoute(
            builder: (_) => HomeScreen(tenant: args['tenant'] as TenantModel),
            settings: settings,
          );
        }
        return _errorRoute('Tenant não fornecido');

      case AppRoutes.serviceDetail:
        if (args != null &&
            args['service'] is ServiceModel &&
            args['tenant'] is TenantModel) {
          return MaterialPageRoute(
            builder: (_) => ServiceDetailScreen(
              service: args['service'] as ServiceModel,
              tenant: args['tenant'] as TenantModel,
            ),
            settings: settings,
          );
        }
        return _errorRoute('Dados do serviço não fornecidos');

      case AppRoutes.booking:
        if (args != null &&
            args['service'] is ServiceModel &&
            args['tenant'] is TenantModel) {
          return MaterialPageRoute(
            builder: (_) => BookingScreen(
              service: args['service'] as ServiceModel,
              tenant: args['tenant'] as TenantModel,
            ),
            settings: settings,
          );
        }
        return _errorRoute('Dados do agendamento não fornecidos');

      case AppRoutes.confirmation:
        if (args != null &&
            args['bookingId'] is String &&
            args['service'] is ServiceModel &&
            args['tenant'] is TenantModel &&
            args['date'] is DateTime &&
            args['time'] is String &&
            args['customerName'] is String) {
          return MaterialPageRoute(
            builder: (_) => ConfirmationScreen(
              bookingId: args['bookingId'] as String,
              service: args['service'] as ServiceModel,
              tenant: args['tenant'] as TenantModel,
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
