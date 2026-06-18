/// Implementação no-op do canal de preview para plataformas não-web
/// (mobile/desktop), onde não existe `window.postMessage`.
void startPreviewListener(void Function(String message) onMessage) {}
