import 'dart:developer' as developer;
import 'package:flutter/foundation.dart';

/// Serviço de logging centralizado.
///
/// Só exibe logs quando [kDebugMode] é verdadeiro,
/// evitando vazamento de informações em produção.
class AppLogger {
  AppLogger._();

  /// Nível de log: info (padrão).
  static const int _infoLevel = 0;

  /// Nível de log: warning.
  static const int _warningLevel = 900;

  /// Nível de log: error.
  static const int _errorLevel = 1000;

  /// Log de debug/info. Só aparece em modo debug.
  static void debug(String message, {String? tag}) {
    if (kDebugMode) {
      developer.log(
        message,
        name: tag ?? 'App',
        level: _infoLevel,
      );
    }
  }

  /// Log de informação.
  static void info(String message, {String? tag}) {
    if (kDebugMode) {
      developer.log(
        message,
        name: tag ?? 'App',
        level: _infoLevel,
      );
    }
  }

  /// Log de warning.
  static void warning(String message, {String? tag}) {
    if (kDebugMode) {
      developer.log(
        message,
        name: tag ?? 'App',
        level: _warningLevel,
      );
    }
  }

  /// Log de erro.
  static void error(
    String message, {
    String? tag,
    Object? error,
    StackTrace? stackTrace,
  }) {
    if (kDebugMode) {
      developer.log(
        message,
        name: tag ?? 'App',
        level: _errorLevel,
        error: error,
        stackTrace: stackTrace,
      );
    }
  }

  /// Log de erro Firebase.
  static void firebaseError(String method, Object error, {String? tag}) {
    if (kDebugMode) {
      developer.log(
        '=== Firebase Error ===',
        name: tag ?? method,
        level: _errorLevel,
      );
      developer.log(
        error.toString(),
        name: tag ?? method,
        level: _errorLevel,
      );
    }
  }

  /// Log de request/response HTTP (para debug de APIs).
  static void network(String message, {String? tag, bool isError = false}) {
    if (kDebugMode) {
      developer.log(
        message,
        name: tag ?? 'Network',
        level: isError ? _errorLevel : _infoLevel,
      );
    }
  }

  /// Log de navegação.
  static void navigation(String routeName, {Map<String, dynamic>? args}) {
    if (kDebugMode) {
      final argsStr = args != null ? ' with args: $args' : '';
      developer.log(
        'Navigating to: $routeName$argsStr',
        name: 'Navigation',
      );
    }
  }

  /// Log de estado do Cubit/Bloc.
  static void state(String cubitName, String stateName, {String? extra}) {
    if (kDebugMode) {
      final extraStr = extra != null ? ' - $extra' : '';
      developer.log(
        '$stateName$extraStr',
        name: cubitName,
      );
    }
  }
}
