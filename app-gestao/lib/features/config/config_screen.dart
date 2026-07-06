import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/providers.dart';
import '../../core/theme/app_spacing.dart';
import 'horarios_screen.dart';
import 'perfil_screen.dart';

class ConfigScreen extends ConsumerWidget {
  const ConfigScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final tenant = ref.watch(tenantProvider).value;

    return Scaffold(
      appBar: AppBar(title: const Text('Configurações')),
      body: ListView(
        padding: AppSpacing.paddingMd,
        children: [
          if (tenant != null)
            Card(
              child: ListTile(
                leading: const Icon(Icons.storefront),
                title: Text(tenant.nome),
                subtitle: Text('Plano: ${tenant.statusAssinatura} · '
                    'vitrine: ${tenant.slug}'),
              ),
            ),
          const SizedBox(height: AppSpacing.sm),
          Card(
            child: ListTile(
              leading: const Icon(Icons.badge),
              title: const Text('Perfil do negócio'),
              subtitle: const Text('Nome, descrição, WhatsApp, endereço'),
              trailing: const Icon(Icons.chevron_right),
              onTap: () => Navigator.push(context,
                  MaterialPageRoute(builder: (_) => const PerfilScreen())),
            ),
          ),
          Card(
            child: ListTile(
              leading: const Icon(Icons.schedule),
              title: const Text('Horários e agendamento'),
              subtitle: const Text(
                  'Funcionamento, antecedências, duração dos horários'),
              trailing: const Icon(Icons.chevron_right),
              onTap: () => Navigator.push(context,
                  MaterialPageRoute(builder: (_) => const HorariosScreen())),
            ),
          ),
          Card(
            child: ListTile(
              leading: const Icon(Icons.palette),
              title: const Text('Personalização da vitrine'),
              subtitle: const Text('Logo, cores, fotos — em breve'),
              enabled: false,
            ),
          ),
          Card(
            child: ListTile(
              leading: const Icon(Icons.credit_card),
              title: const Text('Assinatura'),
              subtitle:
                  const Text('Gerencie seu plano pelo site da Vitrine Virtual'),
              enabled: false,
            ),
          ),
          const SizedBox(height: AppSpacing.lg),
          OutlinedButton.icon(
            onPressed: () => ref.read(firebaseAuthProvider).signOut(),
            icon: const Icon(Icons.logout),
            label: const Text('Sair'),
          ),
        ],
      ),
    );
  }
}
