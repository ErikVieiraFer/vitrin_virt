import 'package:cloud_firestore/cloud_firestore.dart';

class Servico {
  final String id;
  final String nome;
  final String descricao;
  final int duracaoMin;
  final int precoCentavos;
  final String? fotoUrl;
  final bool ativo;

  const Servico({
    required this.id,
    required this.nome,
    required this.descricao,
    required this.duracaoMin,
    required this.precoCentavos,
    this.fotoUrl,
    required this.ativo,
  });

  factory Servico.fromDoc(DocumentSnapshot<Map<String, dynamic>> doc) {
    final d = doc.data()!;
    return Servico(
      id: doc.id,
      nome: d['nome'] ?? '',
      descricao: d['descricao'] ?? '',
      duracaoMin: d['duracaoMin'] ?? 30,
      precoCentavos: d['precoCentavos'] ?? 0,
      fotoUrl: d['fotoUrl'],
      ativo: d['ativo'] ?? true,
    );
  }

  Map<String, dynamic> toMap() => {
        'nome': nome,
        'descricao': descricao,
        'duracaoMin': duracaoMin,
        'precoCentavos': precoCentavos,
        'fotoUrl': fotoUrl,
        'ativo': ativo,
        'atualizadoEm': FieldValue.serverTimestamp(),
      };

  String get precoFormatado =>
      'R\$ ${(precoCentavos / 100).toStringAsFixed(2).replaceAll('.', ',')}';
}
