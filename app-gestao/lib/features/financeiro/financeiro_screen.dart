import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';

import '../../core/models/lancamento.dart';
import '../../core/providers.dart';
import '../../core/theme/app_spacing.dart';
import 'receita_avulsa_form.dart';

enum _Faixa { hoje, semana, mes, mesAnterior }

class FinanceiroScreen extends ConsumerStatefulWidget {
  const FinanceiroScreen({super.key});

  @override
  ConsumerState<FinanceiroScreen> createState() => _FinanceiroScreenState();
}

class _FinanceiroScreenState extends ConsumerState<FinanceiroScreen> {
  _Faixa _faixa = _Faixa.mes;

  Periodo get _periodo {
    final agora = DateTime.now();
    final hoje = DateTime(agora.year, agora.month, agora.day);
    switch (_faixa) {
      case _Faixa.hoje:
        return Periodo(hoje, hoje.add(const Duration(days: 1)));
      case _Faixa.semana:
        final inicioSemana = hoje.subtract(Duration(days: hoje.weekday - 1));
        return Periodo(inicioSemana, inicioSemana.add(const Duration(days: 7)));
      case _Faixa.mes:
        return Periodo(
          DateTime(agora.year, agora.month, 1),
          DateTime(agora.year, agora.month + 1, 1),
        );
      case _Faixa.mesAnterior:
        return Periodo(
          DateTime(agora.year, agora.month - 1, 1),
          DateTime(agora.year, agora.month, 1),
        );
    }
  }

  @override
  Widget build(BuildContext context) {
    final lancamentos = ref.watch(lancamentosProvider(_periodo));
    final profissionais = ref.watch(profissionaisProvider).value ?? const [];
    final servicos = ref.watch(servicosProvider).value ?? const [];

    return Scaffold(
      appBar: AppBar(title: const Text('Financeiro')),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => abrirReceitaAvulsa(context, ref),
        icon: const Icon(Icons.add),
        label: const Text('Receita avulsa'),
      ),
      body: Column(
        children: [
          Padding(
            padding: AppSpacing.paddingHorizontalMd,
            child: SegmentedButton<_Faixa>(
              segments: const [
                ButtonSegment(value: _Faixa.hoje, label: Text('Hoje')),
                ButtonSegment(value: _Faixa.semana, label: Text('Semana')),
                ButtonSegment(value: _Faixa.mes, label: Text('Mês')),
                ButtonSegment(value: _Faixa.mesAnterior, label: Text('Anterior')),
              ],
              selected: {_faixa},
              onSelectionChanged: (s) => setState(() => _faixa = s.first),
            ),
          ),
          Expanded(
            child: lancamentos.when(
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (e, _) => Center(child: Text('Erro: $e')),
              data: (lista) {
                final total =
                    lista.fold<int>(0, (soma, l) => soma + l.valorCentavos);
                final totalComissoes =
                    lista.fold<int>(0, (soma, l) => soma + l.comissaoCentavos);

                // Agrupamentos
                final porProf = <String, int>{};
                final comissaoPorProf = <String, int>{};
                final porServico = <String, int>{};
                for (final l in lista) {
                  if (l.profId != null) {
                    porProf[l.profId!] =
                        (porProf[l.profId!] ?? 0) + l.valorCentavos;
                    comissaoPorProf[l.profId!] =
                        (comissaoPorProf[l.profId!] ?? 0) + l.comissaoCentavos;
                  }
                  if (l.servicoId != null) {
                    porServico[l.servicoId!] =
                        (porServico[l.servicoId!] ?? 0) + l.valorCentavos;
                  }
                }

                String nomeProf(String id) =>
                    profissionais.where((p) => p.id == id).firstOrNull?.nome ??
                    'Profissional removido';
                String nomeServico(String id) =>
                    servicos.where((s) => s.id == id).firstOrNull?.nome ??
                    'Serviço removido';

                return ListView(
                  padding: const EdgeInsets.fromLTRB(
                      AppSpacing.md, AppSpacing.md, AppSpacing.md, 96),
                  children: [
                    // Resumo
                    Row(
                      children: [
                        Expanded(
                          child: _CardResumo(
                            titulo: 'Faturamento',
                            valor: formatarCentavos(total),
                            icone: Icons.trending_up,
                            cor: Colors.green,
                          ),
                        ),
                        const SizedBox(width: AppSpacing.sm),
                        Expanded(
                          child: _CardResumo(
                            titulo: 'Comissões',
                            valor: formatarCentavos(totalComissoes),
                            icone: Icons.percent,
                            cor: Colors.orange,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: AppSpacing.sm),
                    _CardResumo(
                      titulo: 'Atendimentos no período',
                      valor: '${lista.where((l) => l.tipo == 'receita_agendamento').length}',
                      icone: Icons.event_available,
                      cor: Theme.of(context).colorScheme.primary,
                    ),

                    if (porProf.isNotEmpty) ...[
                      const SizedBox(height: AppSpacing.lg),
                      Text('Por profissional',
                          style: Theme.of(context).textTheme.titleMedium),
                      const SizedBox(height: AppSpacing.sm),
                      Card(
                        child: Column(
                          children: porProf.entries.map((e) {
                            return ListTile(
                              dense: true,
                              title: Text(nomeProf(e.key)),
                              subtitle: Text(
                                  'Comissão: ${formatarCentavos(comissaoPorProf[e.key] ?? 0)}'),
                              trailing: Text(formatarCentavos(e.value),
                                  style: Theme.of(context)
                                      .textTheme
                                      .titleSmall),
                            );
                          }).toList(),
                        ),
                      ),
                    ],

                    if (porServico.isNotEmpty) ...[
                      const SizedBox(height: AppSpacing.lg),
                      Text('Por serviço',
                          style: Theme.of(context).textTheme.titleMedium),
                      const SizedBox(height: AppSpacing.sm),
                      Card(
                        child: Column(
                          children: porServico.entries.map((e) {
                            return ListTile(
                              dense: true,
                              title: Text(nomeServico(e.key)),
                              trailing: Text(formatarCentavos(e.value),
                                  style:
                                      Theme.of(context).textTheme.titleSmall),
                            );
                          }).toList(),
                        ),
                      ),
                    ],

                    const SizedBox(height: AppSpacing.lg),
                    Text('Lançamentos',
                        style: Theme.of(context).textTheme.titleMedium),
                    const SizedBox(height: AppSpacing.sm),
                    if (lista.isEmpty)
                      const Padding(
                        padding: AppSpacing.paddingLg,
                        child: Center(
                            child: Text('Nenhum lançamento no período')),
                      )
                    else
                      ...lista.map((l) => Card(
                            child: ListTile(
                              leading: Icon(
                                l.tipo == 'receita_agendamento'
                                    ? Icons.event_available
                                    : Icons.attach_money,
                                color: Colors.green,
                              ),
                              title: Text(
                                l.tipo == 'receita_agendamento'
                                    ? (l.servicoId != null
                                        ? nomeServico(l.servicoId!)
                                        : 'Atendimento')
                                    : (l.descricao?.isNotEmpty == true
                                        ? l.descricao!
                                        : 'Receita avulsa'),
                              ),
                              subtitle: Text([
                                DateFormat('dd/MM HH:mm').format(l.data),
                                if (l.profId != null) nomeProf(l.profId!),
                              ].join(' · ')),
                              trailing:
                                  Text(formatarCentavos(l.valorCentavos)),
                            ),
                          )),
                  ],
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}

class _CardResumo extends StatelessWidget {
  final String titulo;
  final String valor;
  final IconData icone;
  final Color cor;

  const _CardResumo({
    required this.titulo,
    required this.valor,
    required this.icone,
    required this.cor,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: AppSpacing.paddingMd,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Icon(icone, color: cor),
            const SizedBox(height: AppSpacing.sm),
            Text(valor, style: Theme.of(context).textTheme.titleLarge),
            Text(titulo, style: Theme.of(context).textTheme.bodySmall),
          ],
        ),
      ),
    );
  }
}
