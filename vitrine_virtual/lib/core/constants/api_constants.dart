/// Constantes relacionadas a APIs e URLs externas.
class ApiConstants {
  ApiConstants._();

  // ============================================
  // WhatsApp
  // ============================================

  /// URL base do WhatsApp Web API.
  static const String whatsappBaseUrl = 'https://wa.me';

  /// Código do país Brasil.
  static const String brazilCountryCode = '55';

  // ============================================
  // Firebase
  // ============================================

  /// Limite padrão de documentos por query.
  static const int defaultQueryLimit = 50;

  /// Timeout para operações Firebase (em segundos).
  static const int firebaseTimeout = 30;

  // ============================================
  // Imagens
  // ============================================

  /// URL placeholder para imagem não encontrada.
  static const String placeholderImageUrl =
      'https://via.placeholder.com/300x300.png?text=Sem+Imagem';

  /// URL placeholder para logo.
  static const String placeholderLogoUrl =
      'https://via.placeholder.com/100x100.png?text=Logo';

  // ============================================
  // Cache
  // ============================================

  /// Duração do cache em minutos.
  static const int cacheDurationMinutes = 5;

  /// Duração do cache de imagens em dias.
  static const int imageCacheDays = 7;
}
