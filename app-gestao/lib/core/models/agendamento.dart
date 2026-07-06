import 'package:cloud_firestore/cloud_firestore.dart';

class Agendamento {
  final String id;
  final String clienteNome;
  final String clienteWhatsapp;
  final String profId;
  final String servicoId;
  final DateTime inicio;
  final DateTime fim;
  final String status;
  final int precoCentavos;
  final String origem;

  const Agendamento({
    required this.id,
    required this.clienteNome,
    required this.clienteWhatsapp,
    required this.profId,
    required this.servicoId,
    required this.inicio,
    required this.fim,
    required this.status,
    required this.precoCentavos,
    required this.origem,
  });

  factory Agendamento.fromDoc(DocumentSnapshot<Map<String, dynamic>> doc) {
    final d = doc.data()!;
    final cliente = Map<String, dynamic>.from(d['cliente'] ?? const {});
    return Agendamento(
      id: doc.id,
      clienteNome: cliente['nome'] ?? '',
      clienteWhatsapp: cliente['whatsapp'] ?? '',
      profId: d['profId'] ?? '',
      servicoId: d['servicoId'] ?? '',
      inicio: (d['inicio'] as Timestamp).toDate(),
      fim: (d['fim'] as Timestamp).toDate(),
      status: d['status'] ?? 'agendado',
      precoCentavos: d['precoCentavos'] ?? 0,
      origem: d['origem'] ?? 'vitrine',
    );
  }

  bool get ativo => status == 'agendado';

  String get statusLabel => switch (status) {
        'agendado' => 'Agendado',
        'concluido' => 'Concluído',
        'cancelado_cliente' => 'Cancelado pelo cliente',
        'cancelado_dono' => 'Cancelado',
        'no_show' => 'Não compareceu',
        _ => status,
      };
}
