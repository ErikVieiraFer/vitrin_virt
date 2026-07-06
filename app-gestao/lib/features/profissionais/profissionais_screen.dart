import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:cloud_functions/cloud_functions.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/models/profissional.dart';
import '../../core/providers.dart';
import '../../core/theme/app_spacing.dart';
import 'profissional_form.dart';

class ProfissionaisScreen extends ConsumerWidget {
  const ProfissionaisScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final profissionais = ref.watch(profissionaisProvider);
    final tenant = ref.watch(tenantProvider).value;

    return Scaffold(
      appBar: AppBar(title: const Text('Profissionais')),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () async {
          try {
            await abrirFormProfissional(context, ref);
          } on FirebaseFunctionsException catch (e) {
            if (context.mounted) {
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(content: Text(e.message ?? 'Erro ao criar')),
              );
            }
          }
        },
        icon: const Icon(Icons.person_add),
        label: const Text('Novo'),
      ),
      body: profissionais.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('Erro ao carregar: $e')),
        data: (lista) {
          final ativos = lista.where((p) => p.ativo).length;
          return Column(
            children: [
              if (tenant != null)
                Padding(
                  padding: const EdgeInsets.fromLTRB(
                      AppSpacing.md, AppSpacing.md, AppSpacing.md, 0),
                  child: Card(
                    child: ListTile(
                      leading: const Icon(Icons.groups),
                      title: Text(
                          '$ativos de ${tenant.limiteProfissionais} profissionais ativos'),
                      subtitle: ativos >= tenant.limiteProfissionais
                          ? const Text(
                              'Limite do plano atingido — faça upgrade para adicionar mais')
                          : null,
                    ),
                  ),
                ),
              Expanded(
                child: lista.isEmpty
                    ? const Center(
                        child: Text(
                            'Nenhum profissional cadastrado.\nToque em "Novo" para começar.',
                            textAlign: TextAlign.center))
                    : ListView.separated(
                        padding: const EdgeInsets.fromLTRB(
                            AppSpacing.md, AppSpacing.md, AppSpacing.md, 96),
                        itemCount: lista.length,
                        separatorBuilder: (_, __) =>
                            const SizedBox(height: AppSpacing.sm),
                        itemBuilder: (context, i) =>
                            _ProfissionalTile(profissional: lista[i]),
                      ),
              ),
            ],
          );
        },
      ),
    );
  }
}

class _ProfissionalTile extends ConsumerWidget {
  final Profissional profissional;
  const _ProfissionalTile({required this.profissional});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final p = profissional;
    final servicos = ref.watch(servicosProvider).value ?? const [];
    final nomesServicos = servicos
        .where((s) => p.servicoIds.contains(s.id))
        .map((s) => s.nome)
        .join(', ');

    return Card(
      child: ListTile(
        leading: CircleAvatar(
          child: Text(p.nome.isEmpty ? '?' : p.nome[0].toUpperCase()),
        ),
        title: Text(p.nome + (p.ativo ? '' : ' (inativo)')),
        subtitle: Text([
          if (nomesServicos.isNotEmpty) nomesServicos,
          if (p.comissaoPercent > 0)
            'Comissão ${p.comissaoPercent.toStringAsFixed(0)}%',
        ].join(' · ')),
        trailing: PopupMenuButton<String>(
          onSelected: (op) async {
            final tenantId = ref.read(tenantIdProvider).value;
            if (tenantId == null) return;
            final docRef = FirebaseFirestore.instance
                .collection('tenants')
                .doc(tenantId)
                .collection('profissionais')
                .doc(p.id);
            switch (op) {
              case 'editar':
                if (context.mounted) {
                  abrirFormProfissional(context, ref, profissional: p);
                }
              case 'ativo':
                if (p.ativo) {
                  await docRef.update({
                    'ativo': false,
                    'atualizadoEm': FieldValue.serverTimestamp(),
                  });
                } else {
                  // Reativação passa pela Function (limite do plano).
                  try {
                    await ref
                        .read(functionsProvider)
                        .httpsCallable('reativarProfissional')
                        .call({'profId': p.id});
                  } on FirebaseFunctionsException catch (e) {
                    if (context.mounted) {
                      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
                          content: Text(e.message ?? 'Erro ao reativar')));
                    }
                  }
                }
            }
          },
          itemBuilder: (_) => [
            const PopupMenuItem(value: 'editar', child: Text('Editar')),
            PopupMenuItem(
                value: 'ativo', child: Text(p.ativo ? 'Desativar' : 'Ativar')),
          ],
        ),
      ),
    );
  }
}
