import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/providers.dart';
import '../../core/theme/app_spacing.dart';

class PerfilScreen extends ConsumerStatefulWidget {
  const PerfilScreen({super.key});

  @override
  ConsumerState<PerfilScreen> createState() => _PerfilScreenState();
}

class _PerfilScreenState extends ConsumerState<PerfilScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nomeCtrl = TextEditingController();
  final _descCtrl = TextEditingController();
  final _whatsCtrl = TextEditingController();
  bool _carregado = false;
  bool _salvando = false;

  @override
  void dispose() {
    _nomeCtrl.dispose();
    _descCtrl.dispose();
    _whatsCtrl.dispose();
    super.dispose();
  }

  Future<void> _salvar() async {
    if (!_formKey.currentState!.validate()) return;
    final tenantId = ref.read(tenantIdProvider).value;
    if (tenantId == null) return;
    setState(() => _salvando = true);
    try {
      await FirebaseFirestore.instance
          .collection('tenants')
          .doc(tenantId)
          .update({
        'perfil.nome': _nomeCtrl.text.trim(),
        'perfil.descricao': _descCtrl.text.trim(),
        'perfil.telefoneWhatsapp': _whatsCtrl.text.trim(),
        'atualizadoEm': FieldValue.serverTimestamp(),
      });
      if (mounted) {
        ScaffoldMessenger.of(context)
            .showSnackBar(const SnackBar(content: Text('Perfil salvo')));
        Navigator.pop(context);
      }
    } finally {
      if (mounted) setState(() => _salvando = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final tenant = ref.watch(tenantProvider).value;
    if (tenant != null && !_carregado) {
      _nomeCtrl.text = tenant.nome;
      _descCtrl.text = tenant.descricao;
      _whatsCtrl.text = tenant.telefoneWhatsapp;
      _carregado = true;
    }

    return Scaffold(
      appBar: AppBar(title: const Text('Perfil do negócio')),
      body: tenant == null
          ? const Center(child: CircularProgressIndicator())
          : Form(
              key: _formKey,
              child: ListView(
                padding: AppSpacing.paddingLg,
                children: [
                  TextFormField(
                    controller: _nomeCtrl,
                    decoration:
                        const InputDecoration(labelText: 'Nome do negócio'),
                    textCapitalization: TextCapitalization.words,
                    validator: (v) => (v == null || v.trim().length < 2)
                        ? 'Informe o nome'
                        : null,
                  ),
                  const SizedBox(height: AppSpacing.md),
                  TextFormField(
                    controller: _descCtrl,
                    decoration: const InputDecoration(
                        labelText: 'Descrição',
                        helperText: 'Aparece na sua página de agendamento'),
                    maxLines: 3,
                    textCapitalization: TextCapitalization.sentences,
                  ),
                  const SizedBox(height: AppSpacing.md),
                  TextFormField(
                    controller: _whatsCtrl,
                    keyboardType: TextInputType.phone,
                    decoration: const InputDecoration(
                        labelText: 'WhatsApp do negócio',
                        helperText:
                            'Para onde vão as confirmações dos clientes',
                        prefixText: '+55 '),
                  ),
                  const SizedBox(height: AppSpacing.lg),
                  FilledButton(
                    onPressed: _salvando ? null : _salvar,
                    child: Text(_salvando ? 'Salvando…' : 'Salvar'),
                  ),
                ],
              ),
            ),
    );
  }
}
