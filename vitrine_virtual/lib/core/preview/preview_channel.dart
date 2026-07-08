// Facade com conditional import: usa a implementação web (dart:html) quando rodando
// no Flutter Web e um no-op nas demais plataformas (mobile/desktop), mantendo o build
// multiplataforma intacto. Ver Chunk 3 do editor visual.
export 'preview_channel_stub.dart'
    if (dart.library.html) 'preview_channel_web.dart';
