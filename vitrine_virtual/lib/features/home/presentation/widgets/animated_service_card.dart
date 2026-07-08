import 'package:flutter/material.dart';

import '../../../services/domain/entities/service.dart';

/// Card de serviço com 3 estilos personalizáveis e micro-interações:
/// - escala ao pressionar (mobile/web), elevação e zoom da imagem no hover (web).
///
/// Estilos:
/// - `classic`: foto em cima, info embaixo (card vertical).
/// - `overlay`: foto preenche o card com texto sobre um gradiente.
/// - `list`: linha horizontal compacta (foto ao lado das informações).
class AnimatedServiceCard extends StatefulWidget {
  final Service service;
  final VoidCallback onTap;
  final String cardStyle;
  final bool showPrices;

  const AnimatedServiceCard({
    super.key,
    required this.service,
    required this.onTap,
    this.cardStyle = 'classic',
    this.showPrices = true,
  });

  @override
  State<AnimatedServiceCard> createState() => _AnimatedServiceCardState();
}

class _AnimatedServiceCardState extends State<AnimatedServiceCard> {
  bool _hovering = false;
  bool _pressed = false;

  void _setHover(bool v) {
    if (mounted) setState(() => _hovering = v);
  }

  void _setPressed(bool v) {
    if (mounted) setState(() => _pressed = v);
  }

  @override
  Widget build(BuildContext context) {
    final scale = _pressed ? 0.97 : (_hovering ? 1.03 : 1.0);

    return MouseRegion(
      cursor: SystemMouseCursors.click,
      onEnter: (_) => _setHover(true),
      onExit: (_) => _setHover(false),
      child: GestureDetector(
        onTapDown: (_) => _setPressed(true),
        onTapUp: (_) => _setPressed(false),
        onTapCancel: () => _setPressed(false),
        onTap: widget.onTap,
        child: AnimatedScale(
          scale: scale,
          duration: const Duration(milliseconds: 150),
          curve: Curves.easeOut,
          child: _buildCard(context),
        ),
      ),
    );
  }

  Widget _buildCard(BuildContext context) {
    switch (widget.cardStyle) {
      case 'overlay':
        return _overlayCard(context);
      case 'list':
        return _listCard(context);
      default:
        return _classicCard(context);
    }
  }

  /// Casca animada do card (fundo, cantos e sombra que cresce no hover).
  Widget _shell({required Widget child}) {
    return AnimatedContainer(
      duration: const Duration(milliseconds: 200),
      curve: Curves.easeOut,
      clipBehavior: Clip.antiAlias,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: _hovering ? 0.18 : 0.08),
            blurRadius: _hovering ? 22 : 10,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      child: child,
    );
  }

  Widget _image({BoxFit fit = BoxFit.cover}) {
    final s = widget.service;
    return ClipRect(
      child: AnimatedScale(
        scale: _hovering ? 1.08 : 1.0,
        duration: const Duration(milliseconds: 250),
        curve: Curves.easeOut,
        child: SizedBox.expand(
          child: s.hasImage
              ? Image.network(
                  s.imageUrl,
                  fit: fit,
                  errorBuilder: (_, __, ___) => _placeholder(),
                )
              : _placeholder(),
        ),
      ),
    );
  }

  Widget _placeholder() {
    return Container(
      color: Colors.grey.shade200,
      child: Center(
        child: Icon(Icons.image_outlined, color: Colors.grey.shade400, size: 36),
      ),
    );
  }

  Widget _price(BuildContext context, {Color? color}) {
    if (!widget.showPrices) return const SizedBox.shrink();
    final primary = color ?? Theme.of(context).colorScheme.primary;
    return Text(
      widget.service.formattedPrice,
      style: TextStyle(fontWeight: FontWeight.bold, color: primary),
    );
  }

  // ===================== CLASSIC =====================
  Widget _classicCard(BuildContext context) {
    final s = widget.service;
    return _shell(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(child: _image()),
          Padding(
            padding: const EdgeInsets.all(12),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  s.name,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                ),
                const SizedBox(height: 4),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      s.formattedDuration,
                      style: TextStyle(fontSize: 12, color: Colors.grey.shade600),
                    ),
                    _price(context),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // ===================== OVERLAY =====================
  Widget _overlayCard(BuildContext context) {
    final s = widget.service;
    return _shell(
      child: Stack(
        fit: StackFit.expand,
        children: [
          _image(),
          DecoratedBox(
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                colors: [Colors.transparent, Colors.black54, Colors.black87],
                stops: [0.4, 0.75, 1.0],
              ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(14),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.end,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  s.name,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                    fontSize: 16,
                  ),
                ),
                const SizedBox(height: 4),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      s.formattedDuration,
                      style: const TextStyle(color: Colors.white70, fontSize: 12),
                    ),
                    _price(context, color: Colors.white),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // ===================== LIST =====================
  Widget _listCard(BuildContext context) {
    final s = widget.service;
    return _shell(
      child: Padding(
        padding: const EdgeInsets.all(10),
        child: Row(
          children: [
            ClipRRect(
              borderRadius: BorderRadius.circular(12),
              child: SizedBox(width: 84, height: 84, child: _image()),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    s.name,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    s.formattedDuration,
                    style: TextStyle(fontSize: 12, color: Colors.grey.shade600),
                  ),
                  if (s.hasDescription) ...[
                    const SizedBox(height: 4),
                    Text(
                      s.description,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: TextStyle(fontSize: 12, color: Colors.grey.shade500),
                    ),
                  ],
                ],
              ),
            ),
            const SizedBox(width: 8),
            _price(context),
          ],
        ),
      ),
    );
  }
}
