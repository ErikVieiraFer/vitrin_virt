import 'package:dartz/dartz.dart';

import '../../../../core/domain/value_objects/time_slot.dart';
import '../../../../core/errors/failures.dart';
import '../../../../core/utils/date_time_helper.dart';
import '../../domain/repositories/availability_repository.dart';
import '../datasources/booking_remote_datasource.dart';

/// Implementação concreta do [AvailabilityRepository].
///
/// Utiliza [BookingRemoteDatasource] (interface) para buscar dados.
/// Retorna [TimeSlot] value objects para tipagem forte.
class AvailabilityRepositoryImpl implements AvailabilityRepository {
  final BookingRemoteDatasource remoteDatasource;

  AvailabilityRepositoryImpl({required this.remoteDatasource});

  @override
  Future<Either<Failure, List<TimeSlot>>> getAvailableSlots({
    required String tenantId,
    required DateTime date,
  }) async {
    try {
      final dayOfWeek = DateTimeHelper.getDayOfWeek(date);

      // Busca configuração de disponibilidade do dia
      final availabilities =
          await remoteDatasource.getAvailabilityByTenantAndDay(
        tenantId: tenantId,
        dayOfWeek: dayOfWeek,
      );

      if (availabilities.isEmpty) {
        return const Right([]);
      }

      final availability = availabilities.first;

      // Gera todos os slots do dia
      final allSlots = DateTimeHelper.generateTimeSlots(
        startTime: availability.startTime,
        endTime: availability.endTime,
        durationMinutes: availability.slotDurationMinutes,
      );

      // Busca agendamentos existentes para filtrar slots ocupados
      final bookings = await remoteDatasource.getBookingsByTenantAndDate(
        tenantId: tenantId,
        date: date,
      );

      final bookedTimes = bookings.map((b) => b.bookingTime).toSet();

      // Filtra slots disponíveis e converte para TimeSlot
      final availableSlots = allSlots
          .where((slot) => !bookedTimes.contains(slot))
          .map((slot) => TimeSlot(slot))
          .toList();

      return Right(availableSlots);
    } on Failure catch (failure) {
      return Left(failure);
    } catch (e) {
      return const Left(
        UnknownFailure('Erro inesperado ao buscar horários disponíveis'),
      );
    }
  }
}
