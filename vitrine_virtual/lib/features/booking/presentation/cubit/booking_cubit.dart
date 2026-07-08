import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../../core/domain/value_objects/time_slot.dart';
import '../../domain/usecases/create_booking.dart';
import '../../domain/usecases/get_available_slots.dart';
import 'booking_state.dart';

/// Cubit responsável por gerenciar o estado de Booking.
class BookingCubit extends Cubit<BookingState> {
  final GetAvailableSlots getAvailableSlots;
  final CreateBooking createBooking;

  BookingCubit({
    required this.getAvailableSlots,
    required this.createBooking,
  }) : super(const BookingInitial());

  /// Carrega os horários disponíveis para uma data.
  Future<void> loadAvailableSlots({
    required String tenantId,
    required DateTime date,
  }) async {
    emit(const BookingLoadingSlots());

    final result = await getAvailableSlots(
      tenantId: tenantId,
      date: date,
    );

    result.fold(
      (failure) => emit(BookingError(failure.message)),
      (slots) => emit(BookingSlotsLoaded(
        availableSlots: slots,
        selectedDate: date,
      )),
    );
  }

  /// Cria um novo agendamento.
  Future<void> submitBooking({
    required String tenantId,
    required String serviceId,
    required String serviceName,
    required double servicePrice,
    required int serviceDuration,
    required String customerName,
    required String customerPhone,
    required DateTime bookingDate,
    required TimeSlot bookingTime,
  }) async {
    emit(const BookingCreating());

    final result = await createBooking(
      tenantId: tenantId,
      serviceId: serviceId,
      serviceName: serviceName,
      servicePrice: servicePrice,
      serviceDuration: serviceDuration,
      customerName: customerName,
      customerPhone: customerPhone,
      bookingDate: bookingDate,
      bookingTime: bookingTime,
    );

    result.fold(
      (failure) => emit(BookingError(failure.message)),
      (booking) => emit(BookingSuccess(booking)),
    );
  }

  /// Reseta o estado para inicial.
  void reset() {
    emit(const BookingInitial());
  }
}
