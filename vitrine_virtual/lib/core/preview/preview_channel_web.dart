// dart:html é suficiente e isolado a este arquivo (compilado só no Flutter Web via
// conditional import). Evita adicionar package:web só por este listener.
// ignore_for_file: avoid_web_libraries_in_flutter, deprecated_member_use
import 'dart:html' as html;

/// Escuta `window.postMessage` no Flutter Web e repassa a mensagem recebida
/// (JSON em String, enviado pelo editor do painel) para o callback.
///
/// Usado no modo de preview ao vivo (?preview=1): cada edição no painel chega
/// aqui e é aplicada na vitrine sem salvar no Firestore.
void startPreviewListener(void Function(String message) onMessage) {
  html.window.onMessage.listen((event) {
    final data = event.data;
    if (data is String) {
      onMessage(data);
    }
  });
}
