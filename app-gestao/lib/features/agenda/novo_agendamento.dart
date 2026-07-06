import 'package:cloud_functions/cloud_functions.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';

import '../../core/providers.dart';
import '../../core/theme/app_spacing.dart';

Future<void> abrirNovoAgendamento(BuildContext context, WidgetRef ref,
    {required DateTime diaInicial}) {
  return showModalBottomSheet(
    context: context,
    isScrollControlled: true,
    useSafeArea: true,
    builder: (_) => Padding(
      padding:
          EdgeInsets.only(bottom: MediaQuery.of(context).viewInsets.bottom),
      child: _NovoAgendamentoForm(diaInicial: diaInicial),
    ),
  );
}

class _NovoAgendamentoForm extends ConsumerStatefulWidget {
  final DateTime diaInicial;
  const _NovoAgendamentoForm({required this.diaInicial});

  @override
  ConsumerState<_NovoAgendamentoForm> createState() =>
      _NovoAgendamentoFormState();
}

class _NovoAgendamentoFormState extends ConsumerState<_NovoAgendamentoForm> {
  final _formKey = GlobalKey<FormState>();
  final _nomeCtrl = TextEditingController();
  final _whatsCtrl = TextEditingController();
  String? _servicoId;
  String? _profId;
  late DateTime _dia = widget.diaInicial;
  List<String> _slots = const [];
  String? _slotSelecionado;
  bool _buscandoSlots = false;
  bool _salvando = false;
  String? _erro;

  @override
  void dispose() {
    _nomeCtrl.dispose();
    _whatsCtrl.dispose();
    super.dispose();
  }

  Future<void> _buscarSlots() async {
    if (_servicoId == null || _profId == null) return;
    setState(() {
      _buscandoSlots = true;
      _slots = const [];
      _slotSelecionado = null;
    });
    try {
      final tenantId = ref.read(tenantIdProvider).value!;
      final resp =
          await ref.read(functionsProvider).httpsCallable('listarSlots').call({
        'tenantId': tenantId,
        'profId': _profId,
        'servicoId': _servicoId,
        'dataIso': DateFormat('yyyy-MM-dd').format(_dia),
      });
      setState(() =>
          _slots = List<String>.from(resp.data['slots'] as List<dynamic>));
    } on FirebaseFunctionsException catch (e) {
      setState(() => _erro = e.message);
    } finally {
      if (mounted) setState(() => _buscandoSlots = false);
    }
  }

  Future<void> _salvar() async {
    if (!_formKey.currentState!.validate() || _slotSelecionado == null) {
      if (_slotSelecionado == null) {
        setState(() => _erro = 'Escolha um horário');
      }
      return;
    }
    setState(() {
      _salvando = true;
      _erro = null;
    });
    try {
      final tenantId = ref.read(tenantIdProvider).value!;
      await ref
          .read(functionsProvider)
          .httpsCallable('criarAgendamentoManual')
          .call({
        'tenantId': tenantId,
        'profId': _profId,
        'servicoId': _servicoId,
        'inicioIso': _slotSelecionado,
        'cliente': {
          'nome': _nomeCtrl.text.trim(),
          'whatsapp': _whatsCtrl.text.trim(),
        },
      });
      if (mounted) Navigator.pop(context);
    } on FirebaseFunctionsException catch (e) {
      setState(() => _erro = e.message ?? 'Erro ao agendar');
    } finally {
      if (mounted) setState(() => _salvando = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final servicos = (ref.watch(servicosProvider).value ?? const [])
        .where((s) => s.ativo)
        .toList();
    final profissionais = (ref.watch(profissionaisProvider).value ?? const [])
        .where((p) =>
            p.ativo && (_servicoId == null || p.servicoIds.contains(_servicoId)))
        .toList();
    final horaFmt = DateFormat.Hm();

    return Padding(
      padding: AppSpacing.paddingLg,
      child: Form(
        key: _formKey,
        child: ListView(
          shrinkWrap: true,
          children: [
            Text('Novo agendamento',
                style: Theme.of(context).textTheme.titleLarge),
            const SizedBox(height: AppSpacing.lg),
            DropdownButtonFormField<String>(
              initialValue: _servicoId,
              decoration: const InputDecoration(labelText: 'Serviço'),
              items: servicos
                  .map((s) => DropdownMenuItem(
                      value: s.id,
                      child: Text('${s.nome} (${s.duracaoMin} min)')))
                  .toList(),
              onChanged: (v) {
                setState(() {
                  _servicoId = v;
                  _profId = null;
                  _slots = const [];
                  _slotSelecionado = null;
                });
              },
              validator: (v) => v == null ? 'Escolha o serviço' : null,
            ),
            const SizedBox(height: AppSpacing.md),
            DropdownButtonFormField<String>(
              initialValue: _profId,
              decoration: const InputDecoration(labelText: 'Profissional'),
              items: profissionais
                  .map((p) =>
                      DropdownMenuItem(value: p.id, child: Text(p.nome)))
                  .toList(),
              onChanged: (v) {
                setState(() => _profId = v);
                _buscarSlots();
              },
              validator: (v) => v == null ? 'Escolha o profissional' : null,
            ),
            const SizedBox(height: AppSpacing.md),
            ListTile(
              contentPadding: EdgeInsets.zero,
              leading: const Icon(Icons.calendar_today),
              title: Text(DateFormat("d 'de' MMMM", 'pt_BR').format(_dia)),
              trailing: const Icon(Icons.edit),
              onTap: () async {
                final escolhido = await showDatePicker(
                  context: context,
                  initialDate: _dia,
                  firstDate: DateTime.now(),
                  lastDate: DateTime.now().add(const Duration(days: 365)),
                );
                if (escolhido != null) {
                  setState(() => _dia = escolhido);
                  _buscarSlots();
                }
              },
            ),
            if (_buscandoSlots)
              const Center(
                  child: Padding(
                      padding: AppSpacing.paddingMd,
                      child: CircularProgressIndicator()))
            else if (_slots.isNotEmpty) ...[
              const SizedBox(height: AppSpacing.sm),
              Wrap(
                spacing: AppSpacing.sm,
                runSpacing: AppSpacing.sm,
                children: _slots
                    .map((slot) => ChoiceChip(
                          label:
                              Text(horaFmt.format(DateTime.parse(slot).toLocal())),
                          selected: _slotSelecionado == slot,
                          onSelected: (_) =>
                              setState(() => _slotSelecionado = slot),
                        ))
                    .toList(),
              ),
            ] else if (_servicoId != null && _profId != null)
              const Padding(
                padding: AppSpacing.paddingSm,
                child: Text('Nenhum horário livre neste dia'),
              ),
            const SizedBox(height: AppSpacing.md),
            TextFormField(
              controller: _nomeCtrl,
              decoration: const InputDecoration(labelText: 'Nome do cliente'),
              textCapitalization: TextCapitalization.words,
              validator: (v) =>
                  (v == null || v.trim().length < 2) ? 'Informe o nome' : null,
            ),
            const SizedBox(height: AppSpacing.md),
            TextFormField(
              controller: _whatsCtrl,
              keyboardType: TextInputType.phone,
              decoration: const InputDecoration(
                  labelText: 'WhatsApp do cliente', prefixText: '+55 '),
              validator: (v) {
                final digits = (v ?? '').replaceAll(RegExp(r'\D'), '');
                if (digits.length < 10) return 'Número inválido';
                return null;
              },
            ),
            if (_erro != null) ...[
              const SizedBox(height: AppSpacing.md),
              Text(_erro!,
                  style: TextStyle(color: Theme.of(context).colorScheme.error)),
            ],
            const SizedBox(height: AppSpacing.lg),
            FilledButton(
              onPressed: _salvando ? null : _salvar,
              child: Text(_salvando ? 'Agendando…' : 'Agendar'),
            ),
            const SizedBox(height: AppSpacing.md),
          ],
        ),
      ),
    );
  }
}
