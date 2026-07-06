import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/models/tenant.dart';
import '../../core/providers.dart';
import '../../core/theme/app_spacing.dart';

const _diasSemana = [
  'Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado',
];

class HorariosScreen extends ConsumerStatefulWidget {
  const HorariosScreen({super.key});

  @override
  ConsumerState<HorariosScreen> createState() => _HorariosScreenState();
}

class _HorariosScreenState extends ConsumerState<HorariosScreen> {
  Map<String, DiaHorario>? _horarios;
  int? _antecedenciaCancelamento;
  int? _antecedenciaAgendamento;
  int? _duracaoSlot;
  bool _salvando = false;

  void _carregarDe(ConfigAgenda cfg) {
    _horarios ??= Map.of(cfg.horarios);
    _antecedenciaCancelamento ??= cfg.antecedenciaMinCancelamentoMin;
    _antecedenciaAgendamento ??= cfg.antecedenciaMinAgendamentoMin;
    _duracaoSlot ??= cfg.duracaoSlotMin;
  }

  Future<void> _salvar() async {
    final tenantId = ref.read(tenantIdProvider).value;
    if (tenantId == null || _horarios == null) return;
    setState(() => _salvando = true);
    try {
      final cfg = ConfigAgenda(
        duracaoSlotMin: _duracaoSlot!,
        antecedenciaMinCancelamentoMin: _antecedenciaCancelamento!,
        antecedenciaMinAgendamentoMin: _antecedenciaAgendamento!,
        janelaMaxAgendamentoDias:
            ref.read(tenantProvider).value?.configAgenda.janelaMaxAgendamentoDias ?? 90,
        horarios: _horarios!,
      );
      await FirebaseFirestore.instance
          .collection('tenants')
          .doc(tenantId)
          .update({
        'configAgenda': cfg.toMap(),
        'atualizadoEm': FieldValue.serverTimestamp(),
      });
      if (mounted) {
        ScaffoldMessenger.of(context)
            .showSnackBar(const SnackBar(content: Text('Horários salvos')));
        Navigator.pop(context);
      }
    } finally {
      if (mounted) setState(() => _salvando = false);
    }
  }

  Future<void> _editarFaixa(String dia, int? faixaIdx) async {
    final atual = _horarios![dia]!;
    final faixa = faixaIdx == null ? null : atual.faixas[faixaIdx];

    final inicio = await _escolherHora(
        faixa?.inicio ?? '08:00', 'Início do atendimento');
    if (inicio == null) return;
    final fim = await _escolherHora(faixa?.fim ?? '18:00', 'Fim do atendimento');
    if (fim == null) return;

    setState(() {
      final faixas = [...atual.faixas];
      final nova = FaixaHorario(inicio: inicio, fim: fim);
      if (faixaIdx == null) {
        faixas.add(nova);
      } else {
        faixas[faixaIdx] = nova;
      }
      _horarios![dia] = DiaHorario(aberto: atual.aberto, faixas: faixas);
    });
  }

  Future<String?> _escolherHora(String hm, String titulo) async {
    final partes = hm.split(':').map(int.parse).toList();
    final t = await showTimePicker(
      context: context,
      helpText: titulo,
      initialTime: TimeOfDay(hour: partes[0], minute: partes[1]),
    );
    if (t == null) return null;
    return '${t.hour.toString().padLeft(2, '0')}:${t.minute.toString().padLeft(2, '0')}';
  }

  @override
  Widget build(BuildContext context) {
    final tenant = ref.watch(tenantProvider).value;
    if (tenant == null) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }
    _carregarDe(tenant.configAgenda);

    return Scaffold(
      appBar: AppBar(title: const Text('Horários e agendamento')),
      bottomNavigationBar: SafeArea(
        child: Padding(
          padding: AppSpacing.paddingMd,
          child: FilledButton(
            onPressed: _salvando ? null : _salvar,
            child: Text(_salvando ? 'Salvando…' : 'Salvar'),
          ),
        ),
      ),
      body: ListView(
        padding: AppSpacing.paddingMd,
        children: [
          Text('Funcionamento',
              style: Theme.of(context).textTheme.titleMedium),
          const SizedBox(height: AppSpacing.sm),
          for (var d = 0; d < 7; d++) _cardDia('$d'),
          const SizedBox(height: AppSpacing.lg),
          Text('Regras de agendamento',
              style: Theme.of(context).textTheme.titleMedium),
          const SizedBox(height: AppSpacing.sm),
          _cardNumero(
            titulo: 'Antecedência mínima para cancelar/reagendar',
            subtitulo: 'Cliente só cancela pela internet até esse prazo antes',
            valor: _antecedenciaCancelamento!,
            opcoes: const {30: '30 min', 60: '1 h', 120: '2 h', 240: '4 h', 1440: '24 h'},
            aoMudar: (v) => setState(() => _antecedenciaCancelamento = v),
          ),
          _cardNumero(
            titulo: 'Antecedência mínima para agendar',
            subtitulo: 'Quanto tempo antes um horário ainda pode ser marcado',
            valor: _antecedenciaAgendamento!,
            opcoes: const {0: 'Sem limite', 30: '30 min', 60: '1 h', 120: '2 h'},
            aoMudar: (v) => setState(() => _antecedenciaAgendamento = v),
          ),
          _cardNumero(
            titulo: 'Intervalo entre horários',
            subtitulo: 'Grade de horários mostrada ao cliente',
            valor: _duracaoSlot!,
            opcoes: const {15: '15 min', 30: '30 min', 45: '45 min', 60: '1 h'},
            aoMudar: (v) => setState(() => _duracaoSlot = v),
          ),
        ],
      ),
    );
  }

  Widget _cardDia(String dia) {
    final d = _horarios![dia]!;
    return Card(
      child: Column(
        children: [
          SwitchListTile(
            title: Text(_diasSemana[int.parse(dia)]),
            value: d.aberto,
            onChanged: (v) => setState(() {
              _horarios![dia] = DiaHorario(
                aberto: v,
                faixas: d.faixas.isEmpty && v
                    ? [const FaixaHorario(inicio: '08:00', fim: '18:00')]
                    : d.faixas,
              );
            }),
          ),
          if (d.aberto) ...[
            for (var i = 0; i < d.faixas.length; i++)
              ListTile(
                dense: true,
                leading: const Icon(Icons.access_time, size: 20),
                title: Text('${d.faixas[i].inicio} — ${d.faixas[i].fim}'),
                onTap: () => _editarFaixa(dia, i),
                trailing: d.faixas.length > 1
                    ? IconButton(
                        icon: const Icon(Icons.remove_circle_outline),
                        onPressed: () => setState(() {
                          final faixas = [...d.faixas]..removeAt(i);
                          _horarios![dia] =
                              DiaHorario(aberto: d.aberto, faixas: faixas);
                        }),
                      )
                    : null,
              ),
            TextButton.icon(
              onPressed: () => _editarFaixa(dia, null),
              icon: const Icon(Icons.add, size: 18),
              label: const Text('Adicionar faixa (ex: tarde)'),
            ),
          ],
        ],
      ),
    );
  }

  Widget _cardNumero({
    required String titulo,
    required String subtitulo,
    required int valor,
    required Map<int, String> opcoes,
    required ValueChanged<int> aoMudar,
  }) {
    return Card(
      child: ListTile(
        title: Text(titulo),
        subtitle: Text(subtitulo),
        trailing: DropdownButton<int>(
          value: opcoes.containsKey(valor) ? valor : opcoes.keys.first,
          items: opcoes.entries
              .map((e) =>
                  DropdownMenuItem(value: e.key, child: Text(e.value)))
              .toList(),
          onChanged: (v) => v == null ? null : aoMudar(v),
        ),
      ),
    );
  }
}
