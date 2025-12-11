import 'dart:developer' as developer;
import 'package:cloud_firestore/cloud_firestore.dart';

/// Classe base para datasources Firebase.
///
/// Fornece utilitários comuns para logging e tratamento de erros.
abstract class BaseFirebaseDatasource {
  final FirebaseFirestore firestore;

  BaseFirebaseDatasource({required this.firestore});

  /// Loga erros do Firebase de forma padronizada.
  void logFirebaseError(String method, FirebaseException e) {
    developer.log(
      '========================================',
      name: '$runtimeType.$method',
      level: 1000,
    );
    developer.log(
      'ERRO FIREBASE: ${e.code}',
      name: '$runtimeType.$method',
      level: 1000,
    );
    developer.log(
      e.message ?? 'Sem mensagem',
      name: '$runtimeType.$method',
      level: 1000,
    );
    developer.log(
      '========================================',
      name: '$runtimeType.$method',
      level: 1000,
    );
  }

  /// Loga informações de debug.
  void logInfo(String method, String message) {
    developer.log(
      message,
      name: '$runtimeType.$method',
    );
  }

  /// Loga warnings.
  void logWarning(String method, String message) {
    developer.log(
      message,
      name: '$runtimeType.$method',
      level: 900,
    );
  }

  /// Loga erros.
  void logError(String method, String message, [Object? error, StackTrace? stackTrace]) {
    developer.log(
      message,
      name: '$runtimeType.$method',
      level: 1000,
      error: error,
      stackTrace: stackTrace,
    );
  }
}
