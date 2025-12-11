import 'package:flutter/material.dart';

/// Extensões para [BuildContext] que simplificam acesso a recursos comuns.
extension ContextExtensions on BuildContext {
  // ============================================
  // THEME
  // ============================================

  /// Acesso rápido ao [ThemeData] atual.
  ThemeData get theme => Theme.of(this);

  /// Acesso rápido ao [ColorScheme] do tema.
  ColorScheme get colorScheme => theme.colorScheme;

  /// Cor primária do tema.
  Color get primaryColor => colorScheme.primary;

  /// Cor secundária do tema.
  Color get secondaryColor => colorScheme.secondary;

  /// Cor de erro do tema.
  Color get errorColor => colorScheme.error;

  /// Cor de superfície do tema.
  Color get surfaceColor => colorScheme.surface;

  /// Cor de fundo do tema.
  Color get backgroundColor => colorScheme.surface;

  // ============================================
  // TEXT STYLES
  // ============================================

  /// Acesso rápido ao [TextTheme] do tema.
  TextTheme get textTheme => theme.textTheme;

  /// Estilo para títulos grandes.
  TextStyle? get headlineLarge => textTheme.headlineLarge;

  /// Estilo para títulos médios.
  TextStyle? get headlineMedium => textTheme.headlineMedium;

  /// Estilo para títulos pequenos.
  TextStyle? get headlineSmall => textTheme.headlineSmall;

  /// Estilo para títulos de seção.
  TextStyle? get titleLarge => textTheme.titleLarge;

  /// Estilo para subtítulos.
  TextStyle? get titleMedium => textTheme.titleMedium;

  /// Estilo para títulos pequenos.
  TextStyle? get titleSmall => textTheme.titleSmall;

  /// Estilo para corpo de texto grande.
  TextStyle? get bodyLarge => textTheme.bodyLarge;

  /// Estilo para corpo de texto médio.
  TextStyle? get bodyMedium => textTheme.bodyMedium;

  /// Estilo para corpo de texto pequeno.
  TextStyle? get bodySmall => textTheme.bodySmall;

  /// Estilo para labels grandes.
  TextStyle? get labelLarge => textTheme.labelLarge;

  /// Estilo para labels médios.
  TextStyle? get labelMedium => textTheme.labelMedium;

  /// Estilo para labels pequenos.
  TextStyle? get labelSmall => textTheme.labelSmall;

  // ============================================
  // MEDIA QUERY
  // ============================================

  /// Acesso rápido ao [MediaQueryData].
  MediaQueryData get mediaQuery => MediaQuery.of(this);

  /// Largura da tela.
  double get screenWidth => mediaQuery.size.width;

  /// Altura da tela.
  double get screenHeight => mediaQuery.size.height;

  /// Padding seguro (safe area).
  EdgeInsets get safeAreaPadding => mediaQuery.padding;

  /// Verifica se o dispositivo é mobile (largura < 600).
  bool get isMobile => screenWidth < 600;

  /// Verifica se o dispositivo é tablet (600 <= largura < 1200).
  bool get isTablet => screenWidth >= 600 && screenWidth < 1200;

  /// Verifica se o dispositivo é desktop (largura >= 1200).
  bool get isDesktop => screenWidth >= 1200;

  /// Orientação do dispositivo.
  Orientation get orientation => mediaQuery.orientation;

  /// Verifica se está em modo retrato.
  bool get isPortrait => orientation == Orientation.portrait;

  /// Verifica se está em modo paisagem.
  bool get isLandscape => orientation == Orientation.landscape;

  // ============================================
  // NAVIGATION
  // ============================================

  /// Acesso rápido ao [NavigatorState].
  NavigatorState get navigator => Navigator.of(this);

  /// Navega para uma rota nomeada.
  Future<T?> pushNamed<T>(String routeName, {Object? arguments}) {
    return navigator.pushNamed<T>(routeName, arguments: arguments);
  }

  /// Substitui a rota atual por outra.
  Future<T?> pushReplacementNamed<T, TO>(
    String routeName, {
    Object? arguments,
    TO? result,
  }) {
    return navigator.pushReplacementNamed<T, TO>(
      routeName,
      arguments: arguments,
      result: result,
    );
  }

  /// Remove todas as rotas e navega para uma nova.
  Future<T?> pushNamedAndRemoveUntil<T>(
    String routeName,
    bool Function(Route<dynamic>) predicate, {
    Object? arguments,
  }) {
    return navigator.pushNamedAndRemoveUntil<T>(
      routeName,
      predicate,
      arguments: arguments,
    );
  }

  /// Volta para a rota anterior.
  void pop<T>([T? result]) => navigator.pop<T>(result);

  /// Verifica se é possível voltar.
  bool get canPop => navigator.canPop();

  // ============================================
  // SNACKBAR
  // ============================================

  /// Acesso rápido ao [ScaffoldMessengerState].
  ScaffoldMessengerState get scaffoldMessenger => ScaffoldMessenger.of(this);

  /// Exibe um SnackBar com mensagem de sucesso.
  void showSuccessSnackBar(String message) {
    scaffoldMessenger.showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: Colors.green,
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  /// Exibe um SnackBar com mensagem de erro.
  void showErrorSnackBar(String message) {
    scaffoldMessenger.showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: errorColor,
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  /// Exibe um SnackBar informativo.
  void showInfoSnackBar(String message) {
    scaffoldMessenger.showSnackBar(
      SnackBar(
        content: Text(message),
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  /// Remove o SnackBar atual.
  void hideCurrentSnackBar() {
    scaffoldMessenger.hideCurrentSnackBar();
  }

  // ============================================
  // FOCUS
  // ============================================

  /// Remove o foco do widget atual.
  void unfocus() => FocusScope.of(this).unfocus();

  /// Move o foco para o próximo widget.
  void nextFocus() => FocusScope.of(this).nextFocus();

  /// Move o foco para o widget anterior.
  void previousFocus() => FocusScope.of(this).previousFocus();
}
