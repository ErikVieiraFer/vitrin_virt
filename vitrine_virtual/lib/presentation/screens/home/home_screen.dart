import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../data/models/service_model.dart';
import '../../../data/models/tenant_model.dart';
import '../../cubits/services/services_cubit.dart';
import '../../cubits/services/services_state.dart';
import '../../widgets/loading_indicator.dart';
import '../../widgets/error_widget.dart';
import 'widgets/tenant_header.dart';
import 'widgets/service_grid.dart';

class HomeScreen extends StatefulWidget {
  final TenantModel tenant;

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

  void _navigateToServiceDetail(ServiceModel service) {
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
