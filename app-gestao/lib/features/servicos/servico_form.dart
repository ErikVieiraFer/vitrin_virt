import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/models/servico.dart';
import '../../core/providers.dart';
import '../../core/theme/app_spacing.dart';

Future<void> abrirFormServico(BuildContext context, WidgetRef ref,
    {Servico? servico}) {
  return showModalBottomSheet(
    context: context,
    isScrollControlled: true,
    useSafeArea: true,
    builder: (_) => Padding(
      padding:
          EdgeInsets.only(bottom: MediaQuery.of(context).viewInsets.bottom),
      child: _ServicoForm(servico: servico),
    ),
  );
}

class _ServicoForm extends ConsumerStatefulWidget {
  final Servico? servico;
  const _ServicoForm({this.servico});

  @override
  ConsumerState<_ServicoForm> createState() => _ServicoFormState();
}

class _ServicoFormState extends ConsumerState<_ServicoForm> {
  final _formKey = GlobalKey<FormState>();
  late final _nomeCtrl = TextEditingController(text: widget.servico?.nome);
  late final _descCtrl = TextEditingController(text: widget.servico?.descricao);
  late final _duracaoCtrl =
      TextEditingController(text: '${widget.servico?.duracaoMin ?? 30}');
  late final _precoCtrl = TextEditingController(
      text: widget.servico == null
          ? ''
          : (widget.servico!.precoCentavos / 100).toStringAsFixed(2));
  bool _salvando = false;

  @override
  void dispose() {
    _nomeCtrl.dispose();
    _descCtrl.dispose();
    _duracaoCtrl.dispose();
    _precoCtrl.dispose();
    super.dispose();
  }

  Future<void> _salvar() async {
    if (!_formKey.currentState!.validate()) return;
    final tenantId = ref.read(tenantIdProvider).value;
    if (tenantId == null) return;
    setState(() => _salvando = true);

    final precoCentavos =
        (double.parse(_precoCtrl.text.replaceAll(',', '.')) * 100).round();
    final dados = {
      'nome': _nomeCtrl.text.trim(),
      'descricao': _descCtrl.text.trim(),
      'duracaoMin': int.parse(_duracaoCtrl.text),
      'precoCentavos': precoCentavos,
      'atualizadoEm': FieldValue.serverTimestamp(),
    };

    final col = FirebaseFirestore.instance
        .collection('tenants')
        .doc(tenantId)
        .collection('servicos');
    try {
      if (widget.servico == null) {
        await col.add({
          ...dados,
          'fotoUrl': null,
          'ativo': true,
          'criadoEm': FieldValue.serverTimestamp(),
        });
      } else {
        await col.doc(widget.servico!.id).update(dados);
      }
      if (mounted) Navigator.pop(context);
    } finally {
      if (mounted) setState(() => _salvando = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: AppSpacing.paddingLg,
      child: Form(
        key: _formKey,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text(
              widget.servico == null ? 'Novo serviço' : 'Editar serviço',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            const SizedBox(height: AppSpacing.lg),
            TextFormField(
              controller: _nomeCtrl,
              decoration: const InputDecoration(labelText: 'Nome do serviço'),
              textCapitalization: TextCapitalization.sentences,
              validator: (v) =>
                  (v == null || v.trim().length < 2) ? 'Informe o nome' : null,
            ),
            const SizedBox(height: AppSpacing.md),
            TextFormField(
              controller: _descCtrl,
              decoration:
                  const InputDecoration(labelText: 'Descrição (opcional)'),
              textCapitalization: TextCapitalization.sentences,
            ),
            const SizedBox(height: AppSpacing.md),
            Row(
              children: [
                Expanded(
                  child: TextFormField(
                    controller: _duracaoCtrl,
                    keyboardType: TextInputType.number,
                    inputFormatters: [FilteringTextInputFormatter.digitsOnly],
                    decoration:
                        const InputDecoration(labelText: 'Duração (min)'),
                    validator: (v) {
                      final n = int.tryParse(v ?? '');
                      if (n == null || n < 5 || n > 480) return 'Inválido';
                      return null;
                    },
                  ),
                ),
                const SizedBox(width: AppSpacing.md),
                Expanded(
                  child: TextFormField(
                    controller: _precoCtrl,
                    keyboardType:
                        const TextInputType.numberWithOptions(decimal: true),
                    decoration: const InputDecoration(
                        labelText: 'Preço', prefixText: 'R\$ '),
                    validator: (v) {
                      final n =
                          double.tryParse((v ?? '').replaceAll(',', '.'));
                      if (n == null || n < 0) return 'Inválido';
                      return null;
                    },
                  ),
                ),
              ],
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
