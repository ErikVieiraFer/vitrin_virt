import 'package:vitrine_virtual/core/utils/app_logger.dart';

/// Configurações da aplicação
class AppConfig {
  /// Extrai o subdomínio da URL atual
  static String extractSubdomain() {
    final uri = Uri.base;

    AppLogger.debug('Extraindo subdomínio - URI: ${uri.toString()}', tag: 'AppConfig');

    // 1. Primeiro tenta pegar o tenant via query parameter
    final tenantParam = uri.queryParameters['tenant'];
    if (tenantParam != null && tenantParam.isNotEmpty) {
      AppLogger.info('Tenant via query param: $tenantParam', tag: 'AppConfig');
      return tenantParam.toLowerCase().trim();
    }

    // 2. Se não tem query param, extrai do hostname
    final host = uri.host.toLowerCase();
    AppLogger.debug('Host detectado: $host', tag: 'AppConfig');

    // Localhost ou IP local → usa "demo" como padrão
    if (host == 'localhost' || host == '127.0.0.1' || host.isEmpty) {
      AppLogger.info('Localhost detectado, usando demo', tag: 'AppConfig');
      return 'demo';
    }

    // Extrai o subdomínio (primeira parte antes do primeiro ponto)
    final parts = host.split('.');

    // Deve ter pelo menos 3 partes: [subdomain, domain, tld]
    if (parts.length >= 3) {
      final subdomain = parts[0].trim();
      AppLogger.info('Subdomínio extraído: $subdomain', tag: 'AppConfig');
      return subdomain;
    }

    // Fallback para demo
    AppLogger.info('Usando fallback demo', tag: 'AppConfig');
    return 'demo';
  }
}
