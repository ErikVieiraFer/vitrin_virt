import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/providers.dart';
import '../../core/theme/app_spacing.dart';

Future<void> abrirReceitaAvulsa(BuildContext context, WidgetRef ref) {
  return showModalBottomSheet(
    context: context,
    isScrollControlled: true,
    useSafeArea: true,
    builder: (_) => Padding(
      padding:
          EdgeInsets.only(bottom: MediaQuery.of(context).viewInsets.bottom),
      child: const _ReceitaAvulsaForm(),
    ),
  );
}

class _ReceitaAvulsaForm extends ConsumerStatefulWidget {
  const _ReceitaAvulsaForm();

  @override
  ConsumerState<_ReceitaAvulsaForm> createState() => _ReceitaAvulsaFormState();
}

class _ReceitaAvulsaFormState extends ConsumerState<_ReceitaAvulsaForm> {
  final _formKey = GlobalKey<FormState>();
  final _descCtrl = TextEditingController();
  final _valorCtrl = TextEditingController();
  String? _profId;
  bool _salvando = false;

  @override
  void dispose() {
    _descCtrl.dispose();
    _valorCtrl.dispose();
    super.dispose();
  }

  Future<void> _salvar() async {
    if (!_formKey.currentState!.validate()) return;
    final tenantId = ref.read(tenantIdProvider).value;
    if (tenantId == null) return;
    setState(() => _salvando = true);

    final valorCentavos =
        (double.parse(_valorCtrl.text.replaceAll(',', '.')) * 100).round();
    final profissionais = ref.read(profissionaisProvider).value ?? const [];
    final comissao = _profId == null
        ? 0.0
        : profissionais
                .where((p) => p.id == _profId)
                .firstOrNull
                ?.comissaoPercent ??
            0.0;

    try {
      await FirebaseFirestore.instance
          .collection('tenants')
          .doc(tenantId)
          .collection('financeiro')
          .add({
        'tipo': 'receita_avulsa',
        'agendamentoId': null,
        'profId': _profId,
        'servicoId': null,
        'valorCentavos': valorCentavos,
        'comissaoPercentSnapshot': comissao,
        'data': Timestamp.now(),
        'descricao': _descCtrl.text.trim(),
        'criadoEm': FieldValue.serverTimestamp(),
        'atualizadoEm': FieldValue.serverTimestamp(),
      });
      if (mounted) Navigator.pop(context);
    } finally {
      if (mounted) setState(() => _salvando = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final profissionais = (ref.watch(profissionaisProvider).value ?? const [])
        .where((p) => p.ativo)
        .toList();

    return Padding(
      padding: AppSpacing.paddingLg,
      child: Form(
        key: _formKey,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text('Receita avulsa',
                style: Theme.of(context).textTheme.titleLarge),
            const SizedBox(height: AppSpacing.xs),
            Text('Venda de produto, taxa, ou qualquer valor fora da agenda',
                style: Theme.of(context).textTheme.bodySmall),
            const SizedBox(height: AppSpacing.lg),
            TextFormField(
              controller: _descCtrl,
              decoration: const InputDecoration(
                  labelText: 'Descrição', hintText: 'Ex: Pomada modeladora'),
              textCapitalization: TextCapitalization.sentences,
              validator: (v) =>
                  (v == null || v.trim().isEmpty) ? 'Descreva a receita' : null,
            ),
            const SizedBox(height: AppSpacing.md),
            TextFormField(
              controller: _valorCtrl,
              keyboardType:
                  const TextInputType.numberWithOptions(decimal: true),
              decoration:
                  const InputDecoration(labelText: 'Valor', prefixText: 'R\$ '),
              validator: (v) {
                final n = double.tryParse((v ?? '').replaceAll(',', '.'));
                if (n == null || n <= 0) return 'Valor inválido';
                return null;
              },
            ),
            const SizedBox(height: AppSpacing.md),
            DropdownButtonFormField<String?>(
              initialValue: _profId,
              decoration: const InputDecoration(
                  labelText: 'Profissional (opcional)',
                  helperText: 'Se informado, a comissão dele é aplicada'),
              items: [
                const DropdownMenuItem<String?>(
                    value: null, child: Text('Nenhum')),
                ...profissionais.map((p) =>
                    DropdownMenuItem<String?>(value: p.id, child: Text(p.nome))),
              ],
              onChanged: (v) => setState(() => _profId = v),
            ),
            const SizedBox(height: AppSpacing.lg),
            FilledButton(
              onPressed: _salvando ? null : _salvar,
              child: Text(_salvando ? 'Salvando…' : 'Salvar'),
            ),
            const SizedBox(height: AppSpacing.md),
          ],
        ),
      ),
    );
  }
}
