import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';

import '../../core/providers.dart';
import '../../core/theme/app_spacing.dart';

class Bloqueio {
  final String id;
  final String? profId;
  final DateTime inicio;
  final DateTime fim;
  final String? motivo;

  const Bloqueio({
    required this.id,
    this.profId,
    required this.inicio,
    required this.fim,
    this.motivo,
  });

  factory Bloqueio.fromDoc(DocumentSnapshot<Map<String, dynamic>> doc) {
    final d = doc.data()!;
    return Bloqueio(
      id: doc.id,
      profId: d['profId'],
      inicio: (d['inicio'] as Timestamp).toDate(),
      fim: (d['fim'] as Timestamp).toDate(),
      motivo: d['motivo'],
    );
  }
}

final bloqueiosProvider = StreamProvider<List<Bloqueio>>((ref) {
  final tenantId = ref.watch(tenantIdProvider).value;
  if (tenantId == null) return Stream.value(const []);
  return ref
      .watch(firestoreProvider)
      .collection('tenants')
      .doc(tenantId)
      .collection('bloqueios')
      .where('fim', isGreaterThan: Timestamp.now())
      .orderBy('fim')
      .snapshots()
      .map((snap) => snap.docs.map(Bloqueio.fromDoc).toList());
});

class BloqueiosScreen extends ConsumerWidget {
  const BloqueiosScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final bloqueios = ref.watch(bloqueiosProvider);
    final profissionais = ref.watch(profissionaisProvider).value ?? const [];
    final fmt = DateFormat("d/MM HH:mm");

    return Scaffold(
      appBar: AppBar(title: const Text('Bloqueios de horário')),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => _novoBloqueio(context, ref),
        icon: const Icon(Icons.add),
        label: const Text('Bloquear'),
      ),
      body: bloqueios.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('Erro: $e')),
        data: (lista) => lista.isEmpty
            ? const Center(
                child: Text(
                    'Nenhum bloqueio futuro.\nUse bloqueios para folgas, feriados e compromissos.',
                    textAlign: TextAlign.center))
            : ListView.separated(
                padding: const EdgeInsets.fromLTRB(
                    AppSpacing.md, AppSpacing.md, AppSpacing.md, 96),
                itemCount: lista.length,
                separatorBuilder: (_, __) =>
                    const SizedBox(height: AppSpacing.sm),
                itemBuilder: (context, i) {
                  final b = lista[i];
                  final prof = profissionais
                      .where((p) => p.id == b.profId)
                      .firstOrNull;
                  return Card(
                    child: ListTile(
                      leading: const Icon(Icons.event_busy),
                      title: Text(
                          '${fmt.format(b.inicio)} → ${fmt.format(b.fim)}'),
                      subtitle: Text([
                        prof?.nome ?? 'Todos os profissionais',
                        if (b.motivo?.isNotEmpty == true) b.motivo!,
                      ].join(' · ')),
                      trailing: IconButton(
                        icon: const Icon(Icons.delete_outline),
                        onPressed: () async {
                          final tenantId = ref.read(tenantIdProvider).value;
                          if (tenantId == null) return;
                          await FirebaseFirestore.instance
                              .collection('tenants')
                              .doc(tenantId)
                              .collection('bloqueios')
                              .doc(b.id)
                              .delete();
                        },
                      ),
                    ),
                  );
                },
              ),
      ),
    );
  }

  Future<void> _novoBloqueio(BuildContext context, WidgetRef ref) async {
    final profissionais = (ref.read(profissionaisProvider).value ?? const [])
        .where((p) => p.ativo)
        .toList();
    String? profId;
    final motivoCtrl = TextEditingController();

    DateTime? inicio = await _escolherDataHora(context, 'Início do bloqueio');
    if (inicio == null || !context.mounted) return;
    DateTime? fim = await _escolherDataHora(context, 'Fim do bloqueio',
        inicial: inicio.add(const Duration(hours: 1)));
    if (fim == null || !context.mounted) return;
    if (!fim.isAfter(inicio)) {
      ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('O fim deve ser depois do início')));
      return;
    }

    final confirmado = await showDialog<bool>(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, setState) => AlertDialog(
          title: const Text('Novo bloqueio'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              DropdownButtonFormField<String?>(
                initialValue: profId,
                decoration: const InputDecoration(labelText: 'Profissional'),
                items: [
                  const DropdownMenuItem<String?>(
                      value: null, child: Text('Todos')),
                  ...profissionais.map((p) =>
                      DropdownMenuItem<String?>(value: p.id, child: Text(p.nome))),
                ],
                onChanged: (v) => setState(() => profId = v),
              ),
              const SizedBox(height: AppSpacing.md),
              TextField(
                controller: motivoCtrl,
                decoration:
                    const InputDecoration(labelText: 'Motivo (opcional)'),
              ),
            ],
          ),
          actions: [
            TextButton(
                onPressed: () => Navigator.pop(context, false),
                child: const Text('Cancelar')),
            FilledButton(
                onPressed: () => Navigator.pop(context, true),
                child: const Text('Bloquear')),
          ],
        ),
      ),
    );
    if (confirmado != true) return;

    final tenantId = ref.read(tenantIdProvider).value;
    if (tenantId == null) return;
    await FirebaseFirestore.instance
        .collection('tenants')
        .doc(tenantId)
        .collection('bloqueios')
        .add({
      'profId': profId,
      'inicio': Timestamp.fromDate(inicio),
      'fim': Timestamp.fromDate(fim),
      'motivo': motivoCtrl.text.trim(),
      'criadoEm': FieldValue.serverTimestamp(),
    });
  }

  Future<DateTime?> _escolherDataHora(BuildContext context, String titulo,
      {DateTime? inicial}) async {
    final base = inicial ?? DateTime.now();
    final data = await showDatePicker(
      context: context,
      helpText: titulo,
      initialDate: base,
      firstDate: DateTime.now().subtract(const Duration(days: 1)),
      lastDate: DateTime.now().add(const Duration(days: 365)),
    );
    if (data == null || !context.mounted) return null;
    final hora = await showTimePicker(
      context: context,
      helpText: titulo,
      initialTime: TimeOfDay.fromDateTime(base),
    );
    if (hora == null) return null;
    return DateTime(data.year, data.month, data.day, hora.hour, hora.minute);
  }
}
