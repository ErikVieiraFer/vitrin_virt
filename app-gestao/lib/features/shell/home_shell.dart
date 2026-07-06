import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../config/config_screen.dart';
import '../profissionais/profissionais_screen.dart';
import '../servicos/servicos_screen.dart';

class HomeShell extends ConsumerStatefulWidget {
  const HomeShell({super.key});

  @override
  ConsumerState<HomeShell> createState() => _HomeShellState();
}

class _HomeShellState extends ConsumerState<HomeShell> {
  int _aba = 0;

  @override
  Widget build(BuildContext context) {
    final telas = const [
      _AgendaPlaceholder(),
      ServicosScreen(),
      ProfissionaisScreen(),
      ConfigScreen(),
    ];

    return Scaffold(
      body: telas[_aba],
      bottomNavigationBar: NavigationBar(
        selectedIndex: _aba,
        onDestinationSelected: (i) => setState(() => _aba = i),
        destinations: const [
          NavigationDestination(
              icon: Icon(Icons.calendar_month), label: 'Agenda'),
          NavigationDestination(
              icon: Icon(Icons.design_services), label: 'Serviços'),
          NavigationDestination(icon: Icon(Icons.groups), label: 'Equipe'),
          NavigationDestination(icon: Icon(Icons.settings), label: 'Ajustes'),
        ],
      ),
    );
  }
}

class _AgendaPlaceholder extends StatelessWidget {
  const _AgendaPlaceholder();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Agenda')),
      body: const Center(
        child: Text('Agenda chega na Fase 2 🗓️'),
      ),
    );
  }
}
