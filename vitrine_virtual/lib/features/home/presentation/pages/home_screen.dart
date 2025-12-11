import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../../shared/widgets/error_widget.dart';
import '../../../../shared/widgets/loading_indicator.dart';
import '../../../services/domain/entities/service.dart';
import '../../../services/presentation/cubit/services_cubit.dart';
import '../../../services/presentation/cubit/services_state.dart';
import '../../../tenant/domain/entities/tenant.dart';
import '../widgets/service_grid.dart';
import '../widgets/tenant_header.dart';

/// Tela principal que exibe os serviços do tenant.
class HomeScreen extends StatefulWidget {
  final Tenant tenant;

  const HomeScreen({super.key, required this.tenant});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  @override
  void initState() {
    super.initState();
    context.read<ServicesCubit>().loadServices(widget.tenant.id);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Column(
        children: [
          TenantHeader(tenant: widget.tenant),
          Expanded(
            child: BlocBuilder<ServicesCubit, ServicesState>(
              builder: (context, state) {
                if (state is ServicesLoading) {
                  return const LoadingIndicator(
                    message: 'Carregando serviços...',
                  );
                }

                if (state is ServicesError) {
                  return ErrorDisplay(
                    message: state.message,
                    onRetry: () {
                      context
                          .read<ServicesCubit>()
                          .loadServices(widget.tenant.id);
                    },
                  );
                }

                if (state is ServicesLoaded) {
                  return ServiceGrid(
                    services: state.services,
                    onServiceTap: (service) => _navigateToServiceDetail(service),
                  );
                }

                return const SizedBox.shrink();
              },
            ),
          ),
        ],
      ),
    );
  }

  void _navigateToServiceDetail(Service service) {
    Navigator.pushNamed(
      context,
      '/service-detail',
      arguments: {
        'service': service,
        'tenant': widget.tenant,
      },
    );
  }
}
