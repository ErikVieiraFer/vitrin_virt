import 'package:cloud_firestore/cloud_firestore.dart';

class Lancamento {
  final String id;
  final String tipo; // receita_agendamento | receita_avulsa
  final String? agendamentoId;
  final String? profId;
  final String? servicoId;
  final int valorCentavos;
  final double comissaoPercentSnapshot;
  final DateTime data;
  final String? descricao;

  const Lancamento({
    required this.id,
    required this.tipo,
    this.agendamentoId,
    this.profId,
    this.servicoId,
    required this.valorCentavos,
    required this.comissaoPercentSnapshot,
    required this.data,
    this.descricao,
  });

  factory Lancamento.fromDoc(DocumentSnapshot<Map<String, dynamic>> doc) {
    final d = doc.data()!;
    return Lancamento(
      id: doc.id,
      tipo: d['tipo'] ?? 'receita_avulsa',
      agendamentoId: d['agendamentoId'],
      profId: d['profId'],
      servicoId: d['servicoId'],
      valorCentavos: d['valorCentavos'] ?? 0,
      comissaoPercentSnapshot: (d['comissaoPercentSnapshot'] ?? 0).toDouble(),
      data: (d['data'] as Timestamp).toDate(),
      descricao: d['descricao'],
    );
  }

  int get comissaoCentavos =>
      (valorCentavos * comissaoPercentSnapshot / 100).round();
}

String formatarCentavos(int centavos) {
  final valor = (centavos / 100).toStringAsFixed(2).replaceAll('.', ',');
  return 'R\$ $valor';
}
