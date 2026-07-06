import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:cloud_functions/cloud_functions.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/models/profissional.dart';
import '../../core/providers.dart';
import '../../core/theme/app_spacing.dart';

Future<void> abrirFormProfissional(BuildContext context, WidgetRef ref,
    {Profissional? profissional}) {
  return showModalBottomSheet(
    context: context,
    isScrollControlled: true,
    useSafeArea: true,
    builder: (_) => Padding(
      padding:
          EdgeInsets.only(bottom: MediaQuery.of(context).viewInsets.bottom),
      child: _ProfissionalForm(profissional: profissional),
    ),
  );
}

class _ProfissionalForm extends ConsumerStatefulWidget {
  final Profissional? profissional;
  const _ProfissionalForm({this.profissional});

  @override
  ConsumerState<_ProfissionalForm> createState() => _ProfissionalFormState();
}

class _ProfissionalFormState extends ConsumerState<_ProfissionalForm> {
  final _formKey = GlobalKey<FormState>();
  late final _nomeCtrl =
      TextEditingController(text: widget.profissional?.nome);
  late final _comissaoCtrl = TextEditingController(
      text: widget.profissional == null
          ? '0'
          : widget.profissional!.comissaoPercent.toStringAsFixed(0));
  late Set<String> _servicoIds = {...?widget.profissional?.servicoIds};
  bool _salvando = false;
  String? _erro;

  @override
  void dispose() {
    _nomeCtrl.dispose();
    _comissaoCtrl.dispose();
    super.dispose();
  }

  Future<void> _salvar() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() {
      _salvando = true;
      _erro = null;
    });
    try {
      if (widget.profissional == null) {
        // Criação via Cloud Function — enforcement do limite do plano.
        await ref.read(functionsProvider).httpsCallable('criarProfissional').call({
          'nome': _nomeCtrl.text.trim(),
          'servicoIds': _servicoIds.toList(),
          'comissaoPercent': double.parse(_comissaoCtrl.text),
        });
      } else {
        final tenantId = ref.read(tenantIdProvider).value!;
        await FirebaseFirestore.instance
            .collection('tenants')
            .doc(tenantId)
            .collection('profissionais')
            .doc(widget.profissional!.id)
            .update({
          'nome': _nomeCtrl.text.trim(),
          'servicoIds': _servicoIds.toList(),
          'comissaoPercent': double.parse(_comissaoCtrl.text),
          'atualizadoEm': FieldValue.serverTimestamp(),
        });
      }
      if (mounted) Navigator.pop(context);
    } on FirebaseFunctionsException catch (e) {
      setState(() => _erro = e.message ?? 'Erro ao salvar');
    } finally {
      if (mounted) setState(() => _salvando = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final servicos = ref.watch(servicosProvider).value ?? const [];

    return Padding(
      padding: AppSpacing.paddingLg,
      child: Form(
        key: _formKey,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text(
              widget.profissional == null
                  ? 'Novo profissional'
                  : 'Editar profissional',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            const SizedBox(height: AppSpacing.lg),
            TextFormField(
              controller: _nomeCtrl,
              decoration: const InputDecoration(labelText: 'Nome'),
              textCapitalization: TextCapitalization.words,
              validator: (v) =>
                  (v == null || v.trim().length < 2) ? 'Informe o nome' : null,
            ),
            const SizedBox(height: AppSpacing.md),
            TextFormField(
              controller: _comissaoCtrl,
              keyboardType: TextInputType.number,
              decoration: const InputDecoration(
                  labelText: 'Comissão (%)',
                  helperText: 'Usada nos relatórios financeiros'),
              validator: (v) {
                final n = double.tryParse(v ?? '');
                if (n == null || n < 0 || n > 100) return 'Entre 0 e 100';
                return null;
              },
            ),
            const SizedBox(height: AppSpacing.md),
            Align(
              alignment: Alignment.centerLeft,
              child: Text('Serviços que executa',
                  style: Theme.of(context).textTheme.titleSmall),
            ),
            const SizedBox(height: AppSpacing.sm),
            if (servicos.isEmpty)
              const Text('Cadastre serviços primeiro na aba Serviços.')
            else
              Wrap(
                spacing: AppSpacing.sm,
                children: servicos
                    .map((s) => FilterChip(
                          label: Text(s.nome),
                          selected: _servicoIds.contains(s.id),
                          onSelected: (sel) => setState(() {
                            _servicoIds = {..._servicoIds};
                            sel
                                ? _servicoIds.add(s.id)
                                : _servicoIds.remove(s.id);
                          }),
                        ))
                    .toList(),
              ),
            if (_erro != null) ...[
              const SizedBox(height: AppSpacing.md),
              Text(_erro!,
                  style: TextStyle(color: Theme.of(context).colorScheme.error)),
            ],
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
