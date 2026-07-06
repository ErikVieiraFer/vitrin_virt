import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/providers.dart';
import '../../core/theme/app_spacing.dart';
import 'servico_form.dart';

class ServicosScreen extends ConsumerWidget {
  const ServicosScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final servicos = ref.watch(servicosProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Serviços')),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => abrirFormServico(context, ref),
        icon: const Icon(Icons.add),
        label: const Text('Novo serviço'),
      ),
      body: servicos.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('Erro ao carregar: $e')),
        data: (lista) {
          if (lista.isEmpty) {
            return const _EstadoVazio(
              icone: Icons.design_services,
              mensagem:
                  'Nenhum serviço cadastrado.\nToque em "Novo serviço" para começar.',
            );
          }
          return ListView.separated(
            padding: const EdgeInsets.fromLTRB(
                AppSpacing.md, AppSpacing.md, AppSpacing.md, 96),
            itemCount: lista.length,
            separatorBuilder: (_, __) => const SizedBox(height: AppSpacing.sm),
            itemBuilder: (context, i) {
              final s = lista[i];
              return Card(
                child: ListTile(
                  leading: CircleAvatar(
                    child: Icon(s.ativo ? Icons.design_services : Icons.pause),
                  ),
                  title: Text(s.nome),
                  subtitle: Text('${s.duracaoMin} min · ${s.precoFormatado}'
                      '${s.ativo ? '' : ' · inativo'}'),
                  trailing: PopupMenuButton<String>(
                    onSelected: (op) async {
                      final tenantId = ref.read(tenantIdProvider).value;
                      if (tenantId == null) return;
                      final docRef = FirebaseFirestore.instance
                          .collection('tenants')
                          .doc(tenantId)
                          .collection('servicos')
                          .doc(s.id);
                      switch (op) {
                        case 'editar':
                          if (context.mounted) {
                            abrirFormServico(context, ref, servico: s);
                          }
                        case 'ativo':
                          await docRef.update({
                            'ativo': !s.ativo,
                            'atualizadoEm': FieldValue.serverTimestamp(),
                          });
                        case 'excluir':
                          final ok = await _confirmarExclusao(context, s.nome);
                          if (ok) await docRef.delete();
                      }
                    },
                    itemBuilder: (_) => [
                      const PopupMenuItem(value: 'editar', child: Text('Editar')),
                      PopupMenuItem(
                          value: 'ativo',
                          child: Text(s.ativo ? 'Desativar' : 'Ativar')),
                      const PopupMenuItem(
                          value: 'excluir', child: Text('Excluir')),
                    ],
                  ),
                ),
              );
            },
          );
        },
      ),
    );
  }

  Future<bool> _confirmarExclusao(BuildContext context, String nome) async {
    final resposta = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Excluir serviço'),
        content: Text('Excluir "$nome"? Essa ação não pode ser desfeita.'),
        actions: [
          TextButton(
              onPressed: () => Navigator.pop(context, false),
              child: const Text('Cancelar')),
          FilledButton(
              onPressed: () => Navigator.pop(context, true),
              child: const Text('Excluir')),
        ],
      ),
    );
    return resposta ?? false;
  }
}

class _EstadoVazio extends StatelessWidget {
  final IconData icone;
  final String mensagem;
  const _EstadoVazio({required this.icone, required this.mensagem});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icone, size: 64, color: Theme.of(context).colorScheme.outline),
          const SizedBox(height: AppSpacing.md),
          Text(mensagem, textAlign: TextAlign.center),
        ],
      ),
    );
  }
}
