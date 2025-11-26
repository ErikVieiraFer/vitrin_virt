import 'package:equatable/equatable.dart';
import '../../../data/models/booking_model.dart';

abstract class BookingState extends Equatable {
  const BookingState();

  @override
  List<Object?> get props => [];
}

class BookingInitial extends BookingState {
  const BookingInitial();
}

class BookingLoadingSlots extends BookingState {
  const BookingLoadingSlots();
}

class BookingSlotsLoaded extends BookingState {
  final List<String> availableSlots;
  final DateTime selectedDate;

  const BookingSlotsLoaded({
    required this.availableSlots,
    required this.selectedDate,
  });

  @override
  List<Object?> get props => [availableSlots, selectedDate];
}

class BookingCreating extends BookingState {
  const BookingCreating();
}

class BookingSuccess extends BookingState {
  final BookingModel booking;

  const BookingSuccess(this.booking);

  @override
  List<Object?> get props => [booking];
}

class BookingError extends BookingState {
  final String message;

  const BookingError(this.message);

  @override
  List<Object?> get props => [message];
}
