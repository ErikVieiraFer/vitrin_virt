/// Constantes gerais da aplicação.
class AppConstants {
  AppConstants._();

  // ============================================
  // APP INFO
  // ============================================

  /// Nome da aplicação.
  static const String appName = 'Vitrine Virtual';

  /// Versão da aplicação.
  static const String appVersion = '1.0.0';

  /// Tenant padrão para desenvolvimento.
  static const String defaultTenant = 'demo';

  // ============================================
  // TIMEOUTS E LIMITES
  // ============================================

  /// Timeout para requisições (segundos).
  static const int requestTimeout = 30;

  /// Número máximo de tentativas.
  static const int maxRetries = 3;

  /// Tamanho padrão de página para paginação.
  static const int pageSize = 20;

  // ============================================
  // BOOKING
  // ============================================

  /// Duração padrão do slot em minutos.
  static const int slotDurationMinutes = 30;

  /// Máximo de dias para agendamento futuro.
  static const int maxAdvanceBookingDays = 90;

  /// Horário mínimo de funcionamento.
  static const String defaultOpenTime = '08:00';

  /// Horário máximo de funcionamento.
  static const String defaultCloseTime = '18:00';

  // ============================================
  // RESPONSIVE BREAKPOINTS
  // ============================================

  /// Breakpoint para mobile.
  static const int breakpointMobile = 600;

  /// Breakpoint para tablet.
  static const int breakpointTablet = 900;

  /// Breakpoint para desktop.
  static const int breakpointDesktop = 1200;

  // ============================================
  // VALIDAÇÃO
  // ============================================

  /// Padrão regex para telefone brasileiro.
  static const String phonePattern = r'^\+55\s?\d{2}\s?\d{5}-?\d{4}$';

  /// Comprimento mínimo para nome.
  static const int minNameLength = 3;

  /// Comprimento máximo para nome.
  static const int maxNameLength = 100;

  /// Comprimento do telefone brasileiro com DDD (sem código país).
  static const int brazilianPhoneLength = 11;

  /// Comprimento do telefone brasileiro completo (com código país).
  static const int brazilianPhoneFullLength = 13;

  // ============================================
  // UI
  // ============================================

  /// Tamanho padrão do logo.
  static const double logoSize = 100.0;

  /// Tamanho do ícone placeholder.
  static const double placeholderIconSize = 50.0;

  /// Aspect ratio padrão para cards de serviço.
  static const double serviceCardAspectRatio = 0.75;

  /// Duração padrão de animações (ms).
  static const int animationDurationMs = 300;

  /// Duração de exibição do SnackBar (ms).
  static const int snackBarDurationMs = 4000;
}
