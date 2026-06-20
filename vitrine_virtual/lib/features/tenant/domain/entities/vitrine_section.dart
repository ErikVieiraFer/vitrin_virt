import 'package:equatable/equatable.dart';

/// Seção customizável da vitrine (editor visual do painel-cliente).
///
/// Modelada de forma genérica (type + data) para tolerar evolução do schema
/// sem quebrar o parse. Ver /SCHEMA.md (tenants.sections) e o editor no painel.
class VitrineSection extends Equatable {
  final String id;
  final String type; // hero | text | gallery | services
  final int order;
  final Map<String, dynamic> data;

  const VitrineSection({
    required this.id,
    required this.type,
    required this.order,
    required this.data,
  });

  factory VitrineSection.fromJson(Map<String, dynamic> json) {
    final rawData = json['data'];
    return VitrineSection(
      id: (json['id'] ?? '') as String,
      type: (json['type'] ?? '') as String,
      order: (json['order'] is num) ? (json['order'] as num).toInt() : 0,
      data: rawData is Map
          ? rawData.map((k, v) => MapEntry(k.toString(), v))
          : const {},
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'type': type,
        'order': order,
        'data': data,
      };

  // Getters tipados por tipo de seção.
  String get title => (data['title'] ?? '') as String;
  String get subtitle => (data['subtitle'] ?? '') as String;
  String get ctaText => (data['ctaText'] ?? '') as String;
  String get imageUrl => (data['imageUrl'] ?? '') as String;
  String get heading => (data['heading'] ?? '') as String;
  String get body => (data['body'] ?? '') as String;
  bool get showPrices => (data['showPrices'] ?? true) as bool;

  /// Estilo dos cards de serviço: 'classic' | 'overlay' | 'list'.
  String get cardStyle => (data['cardStyle'] ?? 'classic').toString();

  // Redes sociais / endereço.
  String get whatsapp => (data['whatsapp'] ?? '').toString();
  String get instagram => (data['instagram'] ?? '').toString();
  String get facebook => (data['facebook'] ?? '').toString();
  String get tiktok => (data['tiktok'] ?? '').toString();
  String get address => (data['address'] ?? '').toString();
  String get mapUrl => (data['mapUrl'] ?? '').toString();

  /// Itens de listas (depoimentos: {name,text,rating}; horários: {label,value}).
  List<Map<String, dynamic>> get items {
    final raw = data['items'];
    if (raw is List) {
      return raw
          .whereType<Map>()
          .map((e) => e.map((k, v) => MapEntry(k.toString(), v)))
          .toList();
    }
    return const [];
  }

  List<String> get images {
    final raw = data['images'];
    if (raw is List) {
      return raw.map((e) => e.toString()).toList();
    }
    return const [];
  }

  @override
  List<Object?> get props => [id, type, order, data];
}
