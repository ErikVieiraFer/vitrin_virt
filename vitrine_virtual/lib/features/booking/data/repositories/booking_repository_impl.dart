import 'package:dartz/dartz.dart';

import '../../../../core/domain/value_objects/time_slot.dart';
import '../../../../core/errors/failures.dart';
import '../../domain/entities/booking.dart';
import '../../domain/repositories/booking_repository.dart';
import '../datasources/booking_remote_datasource.dart';
import '../models/booking_model.dart';

/// Implementação concreta do [BookingRepository].
///
/// Utiliza [BookingRemoteDatasource] (interface) para operações de dados.
/// Converte Models para Entities antes de retornar.
class BookingRepositoryImpl implements BookingRepository {
  final BookingRemoteDatasource remoteDatasource;

  BookingRepositoryImpl({required this.remoteDatasource});

  @override
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
  }) async {
    try {
      // Verifica se o slot ainda está disponível
      final isAvailable = await remoteDatasource.checkSlotAvailability(
        tenantId: tenantId,
        date: bookingDate,
        time: bookingTime.formatted,
      );

      if (!isAvailable) {
        return const Left(
          ConflictFailure('Horário não está mais disponível'),
        );
      }

      // Cria o model para persistência
      final bookingModel = BookingModel(
        id: '',
        tenantId: tenantId,
        serviceId: serviceId,
        serviceName: serviceName,
        servicePrice: servicePrice,
        serviceDuration: serviceDuration,
        customerName: customerName,
        customerPhone: customerPhone,
        bookingDate: bookingDate,
        bookingTime: bookingTime.formatted,
        status: 'pending',
        createdAt: DateTime.now(),
      );

      final createdModel = await remoteDatasource.createBooking(bookingModel);

      // Converte Model para Entity
      return Right(createdModel.toEntity());
    } on Failure catch (failure) {
      return Left(failure);
    } catch (e) {
      return const Left(
        UnknownFailure('Erro inesperado ao criar agendamento'),
      );
    }
  }
}
