import 'package:dartz/dartz.dart';

import '../../../../core/domain/value_objects/time_slot.dart';
import '../../../../core/errors/failures.dart';
import '../entities/booking.dart';

/// Interface abstrata para o repositório de agendamentos.
///
/// Retorna [Booking] entity, não model, para isolar a camada de domínio.
abstract class BookingRepository {
  /// Cria um novo agendamento.
  ///
  /// Retorna [Right] com [Booking] entity criado.
  /// Retorna [Left] com [Failure] em caso de erro.
  Future<Either<Failure, Booking>> createBooking({
    required String tenantId,
    required String serviceId,
    required String serviceName,
    required double servicePrice,
    required int serviceDuration,
    required String customerName,
    required String customerPhone,
    required DateTime bookingDate,
    required TimeSlot bookingTime,
  });
}
