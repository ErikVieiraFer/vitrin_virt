import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../data/models/service_model.dart';
import '../../../data/models/tenant_model.dart';
import '../../../core/utils/date_time_helper.dart';
import '../../cubits/booking/booking_cubit.dart';
import '../../cubits/booking/booking_state.dart';
import '../../widgets/loading_indicator.dart';
import '../../widgets/custom_button.dart';
import 'widgets/calendar_picker.dart';
import 'widgets/time_slot_grid.dart';
import 'widgets/customer_form.dart';

class BookingScreen extends StatefulWidget {
  final ServiceModel service;
  final TenantModel tenant;

  const BookingScreen({
    super.key,
    required this.service,
    required this.tenant,
  });

  @override
  State<BookingScreen> createState() => _BookingScreenState();
}

class _BookingScreenState extends State<BookingScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _phoneController = TextEditingController();

  DateTime? _selectedDate;
  String? _selectedSlot;

  @override
  void initState() {
    super.initState();
    _selectedDate = DateTimeHelper.today;
    _loadSlots();
  }

  @override
  void dispose() {
    _nameController.dispose();
    _phoneController.dispose();
    super.dispose();
  }

  void _loadSlots() {
    if (_selectedDate != null) {
      context.read<BookingCubit>().loadAvailableSlots(
            tenantId: widget.tenant.id,
            date: _selectedDate!,
          );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Agendar ${widget.service.name}'),
      ),
      body: BlocConsumer<BookingCubit, BookingState>(
        listener: (context, state) {
          if (state is BookingSuccess) {
            _navigateToConfirmation(state.booking.id);
          }
          if (state is BookingError) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text(state.message),
                backgroundColor: Colors.red,
              ),
            );
          }
        },
        builder: (context, state) {
          if (state is BookingCreating) {
            return const LoadingIndicator(
              message: 'Criando agendamento...',
            );
          }

          return Column(
            children: [
              Expanded(
                child: SingleChildScrollView(
                  child: Column(
                    children: [
                      CalendarPicker(
                        selectedDate: _selectedDate,
                        onDateSelected: _onDateSelected,
                      ),
                      if (state is BookingLoadingSlots)
                        const Padding(
                          padding: EdgeInsets.all(32.0),
                          child: LoadingIndicator(
                            message: 'Carregando horários...',
                          ),
                        ),
                      if (state is BookingSlotsLoaded)
                        TimeSlotGrid(
                          slots: state.availableSlots,
                          selectedSlot: _selectedSlot,
                          onSlotSelected: (slot) {
                            setState(() => _selectedSlot = slot);
                          },
                        ),
                      if (_selectedSlot != null)
                        CustomerForm(
                          formKey: _formKey,
                          nameController: _nameController,
                          phoneController: _phoneController,
                        ),
                      const SizedBox(height: 80),
                    ],
                  ),
                ),
              ),
            ],
          );
        },
      ),
      bottomNavigationBar: _buildBottomBar(),
    );
  }

  Widget _buildBottomBar() {
    final canSubmit = _selectedDate != null && _selectedSlot != null;

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.1),
            blurRadius: 8,
            offset: const Offset(0, -2),
          ),
        ],
      ),
      child: SafeArea(
        child: CustomButton(
          text: 'Confirmar Agendamento',
          onPressed: canSubmit ? _submitBooking : null,
          icon: Icons.check,
        ),
      ),
    );
  }

  void _onDateSelected(DateTime date) {
    setState(() {
      _selectedDate = date;
      _selectedSlot = null;
    });
    _loadSlots();
  }

  void _submitBooking() {
    if (!_formKey.currentState!.validate()) {
      return;
    }

    context.read<BookingCubit>().submitBooking(
          tenantId: widget.tenant.id,
          serviceId: widget.service.id,
          customerName: _nameController.text,
          customerPhone: _phoneController.text,
          bookingDate: _selectedDate!,
          bookingTime: _selectedSlot!,
        );
  }

  void _navigateToConfirmation(String bookingId) {
    Navigator.pushReplacementNamed(
      context,
      '/confirmation',
      arguments: {
        'bookingId': bookingId,
        'service': widget.service,
        'tenant': widget.tenant,
        'date': _selectedDate,
        'time': _selectedSlot,
        'customerName': _nameController.text,
      },
    );
  }
}
