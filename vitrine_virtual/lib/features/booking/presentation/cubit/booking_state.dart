import 'package:equatable/equatable.dart';

import '../../../../core/domain/value_objects/time_slot.dart';
import '../../domain/entities/booking.dart';

/// Estados possíveis do BookingCubit.
abstract class BookingState extends Equatable {
  const BookingState();

  @override
  List<Object?> get props => [];
}

/// Estado inicial.
class BookingInitial extends BookingState {
  const BookingInitial();
}

/// Carregando horários disponíveis.
class BookingLoadingSlots extends BookingState {
  const BookingLoadingSlots();
}

/// Horários carregados.
class BookingSlotsLoaded extends BookingState {
  final List<TimeSlot> availableSlots;
  final DateTime selectedDate;

  const BookingSlotsLoaded({
    required this.availableSlots,
    required this.selectedDate,
  });

  /// Verifica se há horários disponíveis.
  bool get hasAvailableSlots => availableSlots.isNotEmpty;

  /// Quantidade de slots disponíveis.
  int get slotsCount => availableSlots.length;

  @override
  List<Object?> get props => [availableSlots, selectedDate];
}

/// Criando agendamento.
class BookingCreating extends BookingState {
  const BookingCreating();
}

/// Agendamento criado com sucesso.
class BookingSuccess extends BookingState {
  final Booking booking;

  const BookingSuccess(this.booking);

  @override
  List<Object?> get props => [booking];
}

/// Estado de erro.
class BookingError extends BookingState {
  final String message;

  const BookingError(this.message);

  @override
  List<Object?> get props => [message];
}
