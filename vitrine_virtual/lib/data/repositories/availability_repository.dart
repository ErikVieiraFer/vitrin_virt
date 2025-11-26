import 'package:dartz/dartz.dart';
import '../../core/errors/failures.dart';
import '../../core/utils/date_time_helper.dart';
import '../datasources/firebase_datasource.dart';

class AvailabilityRepository {
  final FirebaseDatasource datasource;

  AvailabilityRepository({required this.datasource});

  Future<Either<Failure, List<String>>> getAvailableSlots({
    required String tenantId,
    required DateTime date,
  }) async {
    try {
      final dayOfWeek = DateTimeHelper.getDayOfWeek(date);

      final availabilities = await datasource.getAvailabilityByTenantAndDay(
        tenantId: tenantId,
        dayOfWeek: dayOfWeek,
      );

      if (availabilities.isEmpty) {
        return const Right([]);
      }

      final availability = availabilities.first;

      final allSlots = DateTimeHelper.generateTimeSlots(
        startTime: availability.startTime,
        endTime: availability.endTime,
        durationMinutes: availability.slotDurationMinutes,
      );

      final bookings = await datasource.getBookingsByTenantAndDate(
        tenantId: tenantId,
        date: date,
      );

      final bookedTimes = bookings.map((b) => b.bookingTime).toSet();

      final availableSlots = allSlots
          .where((slot) => !bookedTimes.contains(slot))
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
