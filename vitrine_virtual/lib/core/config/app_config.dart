import 'dart:developer' as developer;

/// Configuração da aplicação que detecta o subdomínio da URL atual.
///
/// Lógica de detecção:
/// 1. Se a URL for "raise.vitrinevirt.com" → subdomain = "raise"
/// 2. Se a URL for "demo.vitrinevirt.com?tenant=raise" → subdomain = "raise" (via query param)
/// 3. Se a URL for "demo.vitrinevirt.com" → subdomain = "demo"
/// 4. Em localhost, usa o query param "tenant" ou fallback para "demo"
class AppConfig {
  static const String _defaultSubdomain = 'demo';
  static const String _baseDomain = 'vitrinevirt.com';

  /// Extrai o subdomínio da URL atual do navegador.
  static String extractSubdomain() {
    final uri = Uri.base;
    final host = uri.host;
    final queryParams = uri.queryParameters;

    developer.log(
      'AppConfig: Detectando subdomínio - host: $host, query: $queryParams',
      name: 'AppConfig',
    );

    // Em ambiente de desenvolvimento (localhost)
    if (host == 'localhost' || host == '127.0.0.1' || host.isEmpty) {
      final tenantFromQuery = queryParams['tenant'];
      if (tenantFromQuery != null && tenantFromQuery.isNotEmpty) {
        developer.log(
          'AppConfig: Localhost com tenant query param: $tenantFromQuery',
          name: 'AppConfig',
        );
        return tenantFromQuery;
      }
      developer.log(
        'AppConfig: Localhost sem tenant, usando default: $_defaultSubdomain',
        name: 'AppConfig',
      );
      return _defaultSubdomain;
    }

    // Verifica se há query param "tenant" (fallback para demo.vitrinevirt.com?tenant=xxx)
    final tenantFromQuery = queryParams['tenant'];
    if (tenantFromQuery != null && tenantFromQuery.isNotEmpty) {
      developer.log(
        'AppConfig: Usando tenant do query param: $tenantFromQuery',
        name: 'AppConfig',
      );
      return tenantFromQuery;
    }

    // Extrai subdomínio da URL (ex: raise.vitrinevirt.com → raise)
    final parts = host.split('.');

    // Se tiver formato subdominio.vitrinevirt.com (3 partes)
    if (parts.length >= 3) {
      final subdomain = parts[0];
      developer.log(
        'AppConfig: Subdomínio extraído da URL: $subdomain',
        name: 'AppConfig',
      );
      return subdomain;
    }

    // Se tiver formato vitrinevirt.com (2 partes) sem subdomínio
    if (parts.length == 2 && host.contains(_baseDomain)) {
      developer.log(
        'AppConfig: URL sem subdomínio, usando default: $_defaultSubdomain',
        name: 'AppConfig',
      );
      return _defaultSubdomain;
    }

    // Fallback para qualquer outro caso
    developer.log(
      'AppConfig: Fallback para default: $_defaultSubdomain',
      name: 'AppConfig',
    );
    return _defaultSubdomain;
  }

  /// Retorna a URL base do site para um determinado subdomínio.
  static String getSiteUrl(String subdomain) {
    return 'https://$subdomain.$_baseDomain';
  }
}
