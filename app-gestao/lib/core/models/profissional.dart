import 'package:cloud_firestore/cloud_firestore.dart';

class Profissional {
  final String id;
  final String nome;
  final String? fotoUrl;
  final List<String> servicoIds;
  final double comissaoPercent;
  final bool ativo;

  const Profissional({
    required this.id,
    required this.nome,
    this.fotoUrl,
    required this.servicoIds,
    required this.comissaoPercent,
    required this.ativo,
  });

  factory Profissional.fromDoc(DocumentSnapshot<Map<String, dynamic>> doc) {
    final d = doc.data()!;
    return Profissional(
      id: doc.id,
      nome: d['nome'] ?? '',
      fotoUrl: d['fotoUrl'],
      servicoIds: List<String>.from(d['servicoIds'] ?? const []),
      comissaoPercent: (d['comissaoPercent'] ?? 0).toDouble(),
      ativo: d['ativo'] ?? true,
    );
  }
}
