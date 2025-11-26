import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../domain/usecases/create_booking.dart';
import '../../../domain/usecases/get_available_slots.dart';
import 'booking_state.dart';

class BookingCubit extends Cubit<BookingState> {
  final GetAvailableSlots getAvailableSlots;
  final CreateBooking createBooking;

  BookingCubit({
    required this.getAvailableSlots,
    required this.createBooking,
  }) : super(const BookingInitial());

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

  Future<void> submitBooking({
    required String tenantId,
    required String serviceId,
    required String customerName,
    required String customerPhone,
    required DateTime bookingDate,
    required String bookingTime,
  }) async {
    emit(const BookingCreating());

    final result = await createBooking(
      tenantId: tenantId,
      serviceId: serviceId,
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

  void reset() {
    emit(const BookingInitial());
  }
}
