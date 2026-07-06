import 'package:cloud_functions/cloud_functions.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';

import '../../core/models/agendamento.dart';
import '../../core/providers.dart';
import '../../core/theme/app_spacing.dart';
import 'bloqueios_screen.dart';
import 'novo_agendamento.dart';

class AgendaScreen extends ConsumerStatefulWidget {
  const AgendaScreen({super.key});

  @override
  ConsumerState<AgendaScreen> createState() => _AgendaScreenState();
}

class _AgendaScreenState extends ConsumerState<AgendaScreen> {
  DateTime _dia = DateTime.now();
  String? _filtroProfId;

  @override
  Widget build(BuildContext context) {
    final agendamentos = ref.watch(agendamentosDoDiaProvider(_dia));
    final profissionais = ref.watch(profissionaisProvider).value ?? const [];

    return Scaffold(
      appBar: AppBar(
        title: const Text('Agenda'),
        actions: [
          IconButton(
            tooltip: 'Bloqueios de horário',
            icon: const Icon(Icons.event_busy),
            onPressed: () => Navigator.push(context,
                MaterialPageRoute(builder: (_) => const BloqueiosScreen())),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => abrirNovoAgendamento(context, ref, diaInicial: _dia),
        icon: const Icon(Icons.add),
        label: const Text('Agendar'),
      ),
      body: Column(
        children: [
          _seletorDia(),
          if (profissionais.length > 1)
            SizedBox(
              height: 48,
              child: ListView(
                scrollDirection: Axis.horizontal,
                padding: AppSpacing.paddingHorizontalMd,
                children: [
                  ChoiceChip(
                    label: const Text('Todos'),
                    selected: _filtroProfId == null,
                    onSelected: (_) => setState(() => _filtroProfId = null),
                  ),
                  const SizedBox(width: AppSpacing.sm),
                  ...profissionais.where((p) => p.ativo).map((p) => Padding(
                        padding: const EdgeInsets.only(right: AppSpacing.sm),
                        child: ChoiceChip(
                          label: Text(p.nome),
                          selected: _filtroProfId == p.id,
                          onSelected: (_) =>
                              setState(() => _filtroProfId = p.id),
                        ),
                      )),
                ],
              ),
            ),
          Expanded(
            child: agendamentos.when(
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (e, _) => Center(child: Text('Erro: $e')),
              data: (lista) {
                final visiveis = _filtroProfId == null
                    ? lista
                    : lista.where((a) => a.profId == _filtroProfId).toList();
                if (visiveis.isEmpty) {
                  return const Center(
                      child: Text('Nenhum agendamento neste dia'));
                }
                return ListView.separated(
                  padding: const EdgeInsets.fromLTRB(
                      AppSpacing.md, AppSpacing.md, AppSpacing.md, 96),
                  itemCount: visiveis.length,
                  separatorBuilder: (_, __) =>
                      const SizedBox(height: AppSpacing.sm),
                  itemBuilder: (context, i) =>
                      _AgendamentoCard(agendamento: visiveis[i]),
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _seletorDia() {
    final fmt = DateFormat("EEE, d 'de' MMMM", 'pt_BR');
    final hoje = DateTime.now();
    final ehHoje = _dia.year == hoje.year &&
        _dia.month == hoje.month &&
        _dia.day == hoje.day;

    return Padding(
      padding: AppSpacing.paddingHorizontalMd,
      child: Row(
        children: [
          IconButton(
            icon: const Icon(Icons.chevron_left),
            onPressed: () =>
                setState(() => _dia = _dia.subtract(const Duration(days: 1))),
          ),
          Expanded(
            child: TextButton(
              onPressed: () async {
                final escolhido = await showDatePicker(
                  context: context,
                  initialDate: _dia,
                  firstDate: hoje.subtract(const Duration(days: 365)),
                  lastDate: hoje.add(const Duration(days: 365)),
                );
                if (escolhido != null) setState(() => _dia = escolhido);
              },
              child: Text(
                ehHoje ? 'Hoje' : fmt.format(_dia),
                style: Theme.of(context).textTheme.titleMedium,
              ),
            ),
          ),
          IconButton(
            icon: const Icon(Icons.chevron_right),
            onPressed: () =>
                setState(() => _dia = _dia.add(const Duration(days: 1))),
          ),
        ],
      ),
    );
  }
}

class _AgendamentoCard extends ConsumerWidget {
  final Agendamento agendamento;
  const _AgendamentoCard({required this.agendamento});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final a = agendamento;
    final hora = DateFormat.Hm();
    final servicos = ref.watch(servicosProvider).value ?? const [];
    final profissionais = ref.watch(profissionaisProvider).value ?? const [];
    final servico = servicos.where((s) => s.id == a.servicoId).firstOrNull;
    final prof = profissionais.where((p) => p.id == a.profId).firstOrNull;

    final cor = switch (a.status) {
      'agendado' => Theme.of(context).colorScheme.primary,
      'concluido' => Colors.green,
      'no_show' => Colors.orange,
      _ => Theme.of(context).colorScheme.outline,
    };

    return Card(
      child: ListTile(
        leading: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(hora.format(a.inicio),
                style: Theme.of(context)
                    .textTheme
                    .titleMedium
                    ?.copyWith(color: cor, fontWeight: FontWeight.bold)),
            Text(hora.format(a.fim),
                style: Theme.of(context).textTheme.bodySmall),
          ],
        ),
        title: Text(a.clienteNome),
        subtitle: Text([
          if (servico != null) servico.nome,
          if (prof != null) prof.nome,
          if (!a.ativo) a.statusLabel,
        ].join(' · ')),
        trailing: a.ativo
            ? PopupMenuButton<String>(
                onSelected: (status) => _mudarStatus(context, ref, status),
                itemBuilder: (_) => const [
                  PopupMenuItem(value: 'concluido', child: Text('Concluir ✔')),
                  PopupMenuItem(value: 'no_show', child: Text('Não compareceu')),
                  PopupMenuItem(
                      value: 'cancelado_dono', child: Text('Cancelar')),
                ],
              )
            : null,
      ),
    );
  }

  Future<void> _mudarStatus(
      BuildContext context, WidgetRef ref, String status) async {
    try {
      await ref
          .read(functionsProvider)
          .httpsCallable('atualizarStatusAgendamento')
          .call({'agendamentoId': agendamento.id, 'status': status});
    } on FirebaseFunctionsException catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(context)
            .showSnackBar(SnackBar(content: Text(e.message ?? 'Erro')));
      }
    }
  }
}
