import 'package:dartz/dartz.dart';
import '../../core/errors/failures.dart';
import '../datasources/firebase_datasource.dart';
import '../models/booking_model.dart';

class BookingRepository {
  final FirebaseDatasource datasource;

  BookingRepository({required this.datasource});

  Future<Either<Failure, BookingModel>> createBooking({
    required String tenantId,
    required String serviceId,
    required String customerName,
    required String customerPhone,
    required DateTime bookingDate,
    required String bookingTime,
  }) async {
    try {
      final isAvailable = await datasource.checkSlotAvailability(
        tenantId: tenantId,
        date: bookingDate,
        time: bookingTime,
      );

      if (!isAvailable) {
        return const Left(
          ConflictFailure('Horário não está mais disponível'),
        );
      }

      final booking = BookingModel(
        id: '',
        tenantId: tenantId,
        serviceId: serviceId,
        customerName: customerName,
        customerPhone: customerPhone,
        bookingDate: bookingDate,
        bookingTime: bookingTime,
        status: 'pending',
        createdAt: DateTime.now(),
      );

      final createdBooking = await datasource.createBooking(booking);
      return Right(createdBooking);
    } on Failure catch (failure) {
      return Left(failure);
    } catch (e) {
      return const Left(
        UnknownFailure('Erro inesperado ao criar agendamento'),
      );
    }
  }
}
