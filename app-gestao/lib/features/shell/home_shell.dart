import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/fcm.dart';
import '../agenda/agenda_screen.dart';
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
  void initState() {
    super.initState();
    registrarPush();
  }

  @override
  Widget build(BuildContext context) {
    final telas = const [
      AgendaScreen(),
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

