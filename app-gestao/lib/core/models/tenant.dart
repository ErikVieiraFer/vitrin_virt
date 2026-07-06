import 'package:cloud_firestore/cloud_firestore.dart';

class FaixaHorario {
  final String inicio; // 'HH:mm'
  final String fim;
  const FaixaHorario({required this.inicio, required this.fim});

  factory FaixaHorario.fromMap(Map<String, dynamic> m) =>
      FaixaHorario(inicio: m['inicio'] ?? '08:00', fim: m['fim'] ?? '18:00');

  Map<String, dynamic> toMap() => {'inicio': inicio, 'fim': fim};
}

class DiaHorario {
  final bool aberto;
  final List<FaixaHorario> faixas;
  const DiaHorario({required this.aberto, required this.faixas});

  factory DiaHorario.fromMap(Map<String, dynamic>? m) {
    if (m == null) return const DiaHorario(aberto: false, faixas: []);
    return DiaHorario(
      aberto: m['aberto'] ?? false,
      faixas: List<Map<String, dynamic>>.from(m['faixas'] ?? const [])
          .map(FaixaHorario.fromMap)
          .toList(),
    );
  }

  Map<String, dynamic> toMap() =>
      {'aberto': aberto, 'faixas': faixas.map((f) => f.toMap()).toList()};
}

class ConfigAgenda {
  final int duracaoSlotMin;
  final int antecedenciaMinCancelamentoMin;
  final int antecedenciaMinAgendamentoMin;
  final int janelaMaxAgendamentoDias;
  final Map<String, DiaHorario> horarios; // '0'..'6'

  const ConfigAgenda({
    required this.duracaoSlotMin,
    required this.antecedenciaMinCancelamentoMin,
    required this.antecedenciaMinAgendamentoMin,
    required this.janelaMaxAgendamentoDias,
    required this.horarios,
  });

  factory ConfigAgenda.fromMap(Map<String, dynamic>? m) {
    m ??= const {};
    final horariosRaw = Map<String, dynamic>.from(m['horarios'] ?? const {});
    return ConfigAgenda(
      duracaoSlotMin: m['duracaoSlotMin'] ?? 30,
      antecedenciaMinCancelamentoMin: m['antecedenciaMinCancelamentoMin'] ?? 120,
      antecedenciaMinAgendamentoMin: m['antecedenciaMinAgendamentoMin'] ?? 30,
      janelaMaxAgendamentoDias: m['janelaMaxAgendamentoDias'] ?? 90,
      horarios: {
        for (var d = 0; d < 7; d++)
          '$d': DiaHorario.fromMap(
              horariosRaw['$d'] as Map<String, dynamic>?),
      },
    );
  }

  Map<String, dynamic> toMap() => {
        'fusoHorario': 'America/Sao_Paulo',
        'duracaoSlotMin': duracaoSlotMin,
        'antecedenciaMinCancelamentoMin': antecedenciaMinCancelamentoMin,
        'antecedenciaMinAgendamentoMin': antecedenciaMinAgendamentoMin,
        'janelaMaxAgendamentoDias': janelaMaxAgendamentoDias,
        'horarios': horarios.map((k, v) => MapEntry(k, v.toMap())),
      };
}

class Tenant {
  final String id;
  final String nome;
  final String slug;
  final String descricao;
  final String telefoneWhatsapp;
  final String statusAssinatura;
  final int limiteProfissionais;
  final ConfigAgenda configAgenda;

  const Tenant({
    required this.id,
    required this.nome,
    required this.slug,
    required this.descricao,
    required this.telefoneWhatsapp,
    required this.statusAssinatura,
    required this.limiteProfissionais,
    required this.configAgenda,
  });

  factory Tenant.fromDoc(DocumentSnapshot<Map<String, dynamic>> doc) {
    final d = doc.data()!;
    final perfil = Map<String, dynamic>.from(d['perfil'] ?? const {});
    final assinatura = Map<String, dynamic>.from(d['assinatura'] ?? const {});
    return Tenant(
      id: doc.id,
      nome: perfil['nome'] ?? '',
      slug: perfil['slug'] ?? '',
      descricao: perfil['descricao'] ?? '',
      telefoneWhatsapp: perfil['telefoneWhatsapp'] ?? '',
      statusAssinatura: assinatura['status'] ?? 'trial',
      limiteProfissionais: assinatura['limiteProfissionais'] ?? 1,
      configAgenda:
          ConfigAgenda.fromMap(d['configAgenda'] as Map<String, dynamic>?),
    );
  }
}
