import 'dart:developer' as developer;

/// Configurações da aplicação
class AppConfig {
  /// Extrai o subdomínio da URL atual
  static String extractSubdomain() {
    final uri = Uri.base;

    developer.log('=== AppConfig.extractSubdomain INICIADO ===', name: 'AppConfig');
    developer.log('URI completa: ${uri.toString()}', name: 'AppConfig');

    // 1. Primeiro tenta pegar o tenant via query parameter
    final tenantParam = uri.queryParameters['tenant'];
    if (tenantParam != null && tenantParam.isNotEmpty) {
      developer.log('Tenant via query param: $tenantParam', name: 'AppConfig');
      return tenantParam.toLowerCase().trim();
    }

    // 2. Se não tem query param, extrai do hostname
    final host = uri.host.toLowerCase();
    developer.log('Host detectado: $host', name: 'AppConfig');

    // Localhost ou IP local → usa "demo" como padrão
    if (host == 'localhost' || host == '127.0.0.1' || host.isEmpty) {
      developer.log('Localhost detectado, usando demo', name: 'AppConfig');
      return 'demo';
    }

    // Extrai o subdomínio (primeira parte antes do primeiro ponto)
    final parts = host.split('.');
    developer.log('Host dividido em partes: $parts', name: 'AppConfig');

    // Deve ter pelo menos 3 partes: [subdomain, domain, tld]
    if (parts.length >= 3) {
      final subdomain = parts[0].trim();
      developer.log('Subdomínio extraído: $subdomain', name: 'AppConfig');
      return subdomain;
    }

    // Fallback para demo
    developer.log('Usando fallback demo', name: 'AppConfig');
    return 'demo';
  }
}
