import 'package:cloud_firestore/cloud_firestore.dart';

import '../../../core/utils/app_logger.dart';

/// Classe base para datasources Firebase.
///
/// Fornece utilitários comuns para logging e tratamento de erros.
abstract class BaseFirebaseDatasource {
  final FirebaseFirestore firestore;

  BaseFirebaseDatasource({required this.firestore});

  /// Loga erros do Firebase de forma padronizada.
  void logFirebaseError(String method, FirebaseException e) {
    AppLogger.firebaseError(
      method,
      e,
      tag: '$runtimeType.$method',
    );
  }

  /// Loga informações de debug.
  void logInfo(String method, String message) {
    AppLogger.info(
      message,
      tag: '$runtimeType.$method',
    );
  }

  /// Loga warnings.
  void logWarning(String method, String message) {
    AppLogger.warning(
      message,
      tag: '$runtimeType.$method',
    );
  }

  /// Loga erros.
  void logError(String method, String message, [Object? error, StackTrace? stackTrace]) {
    AppLogger.error(
      message,
      tag: '$runtimeType.$method',
      error: error,
      stackTrace: stackTrace,
    );
  }
}
