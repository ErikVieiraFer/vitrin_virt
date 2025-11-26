import 'package:flutter/material.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/utils/date_time_helper.dart';
import '../../../core/utils/url_launcher_helper.dart';
import '../../../data/models/service_model.dart';
import '../../../data/models/tenant_model.dart';
import '../../widgets/custom_button.dart';

class ConfirmationScreen extends StatelessWidget {
  final String bookingId;
  final ServiceModel service;
  final TenantModel tenant;
  final DateTime date;
  final String time;
  final String customerName;

  const ConfirmationScreen({
    super.key,
    required this.bookingId,
    required this.service,
    required this.tenant,
    required this.date,
    required this.time,
    required this.customerName,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Agendamento Confirmado'),
        automaticallyImplyLeading: false,
      ),
      body: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              const SizedBox(height: 32),
              Container(
                width: 120,
                height: 120,
                decoration: BoxDecoration(
                  color: AppColors.success.withValues(alpha: 0.1),
                  shape: BoxShape.circle,
                ),
                child: const Icon(
                  Icons.check_circle,
                  size: 80,
                  color: AppColors.success,
                ),
              ),
              const SizedBox(height: 24),
              Text(
                'Agendamento Realizado!',
                style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 8),
              Text(
                'Seu agendamento foi criado com sucesso',
                style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                      color: AppColors.textSecondary,
                    ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 32),
              _buildInfoCard(context),
              const SizedBox(height: 24),
              _buildWhatsAppButton(context),
              const SizedBox(height: 16),
              CustomButton(
                text: 'Voltar para Início',
                onPressed: () => _navigateToHome(context),
                isOutlined: true,
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildInfoCard(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            _InfoRow(
              icon: Icons.business,
              label: 'Estabelecimento',
              value: tenant.name,
            ),
            const Divider(height: 24),
            _InfoRow(
              icon: Icons.design_services,
              label: 'Serviço',
              value: service.name,
            ),
            const Divider(height: 24),
            _InfoRow(
              icon: Icons.calendar_today,
              label: 'Data',
              value: DateTimeHelper.formatDate(date),
            ),
            const Divider(height: 24),
            _InfoRow(
              icon: Icons.access_time,
              label: 'Horário',
              value: time,
            ),
            const Divider(height: 24),
            _InfoRow(
              icon: Icons.person,
              label: 'Nome',
              value: customerName,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildWhatsAppButton(BuildContext context) {
    return CustomButton(
      text: 'Confirmar via WhatsApp',
      icon: Icons.chat,
      onPressed: () => _openWhatsApp(context),
    );
  }

  void _openWhatsApp(BuildContext context) {
    final message = _buildWhatsAppMessage();

    UrlLauncherHelper.openWhatsApp(
      phone: tenant.whatsapp,
      message: message,
    ).then((success) {
      if (!success && context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Não foi possível abrir o WhatsApp'),
            backgroundColor: AppColors.error,
          ),
        );
      }
    });
  }

  String _buildWhatsAppMessage() {
    return '''
Olá! Gostaria de confirmar meu agendamento:

Serviço: ${service.name}
Data: ${DateTimeHelper.formatDate(date)}
Horário: $time
Nome: $customerName

Aguardo confirmação. Obrigado!
''';
  }

  void _navigateToHome(BuildContext context) {
    Navigator.pushNamedAndRemoveUntil(
      context,
      '/home',
      (route) => false,
    );
  }
}

class _InfoRow extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;

  const _InfoRow({
    required this.icon,
    required this.label,
    required this.value,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Icon(
          icon,
          size: 24,
          color: Theme.of(context).colorScheme.primary,
        ),
        const SizedBox(width: 16),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                      color: AppColors.textSecondary,
                    ),
              ),
              const SizedBox(height: 4),
              Text(
                value,
                style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                      fontWeight: FontWeight.w600,
                    ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}
