import 'package:dartz/dartz.dart';

import '../../../../core/domain/value_objects/phone.dart';
import '../../../../core/domain/value_objects/time_slot.dart';
import '../../../../core/errors/failures.dart';
import '../../../../core/utils/date_time_helper.dart';
import '../entities/booking.dart';
import '../repositories/booking_repository.dart';

/// Caso de uso para criar um agendamento.
class CreateBooking {
  final BookingRepository repository;

  CreateBooking({required this.repository});

  /// Executa o caso de uso.
  ///
  /// Valida todos os campos antes de criar o agendamento.
  Future<Either<Failure, Booking>> call({
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
    // Validação do nome
    final trimmedName = customerName.trim();
    if (trimmedName.isEmpty) {
      return const Left(ValidationFailure('Nome é obrigatório'));
    }
    if (trimmedName.length < 2) {
      return const Left(ValidationFailure('Nome deve ter pelo menos 2 caracteres'));
    }

    // Validação do telefone usando Phone value object
    final phone = Phone(customerPhone);
    if (!phone.isValid) {
      return const Left(ValidationFailure('Telefone inválido'));
    }

    // Validação do tenant
    if (tenantId.trim().isEmpty) {
      return const Left(ValidationFailure('ID do tenant não pode ser vazio'));
    }

    // Validação do serviço
    if (serviceId.trim().isEmpty) {
      return const Left(ValidationFailure('ID do serviço não pode ser vazio'));
    }

    // Validação da data
    if (DateTimeHelper.isPastDate(bookingDate)) {
      return const Left(
        ValidationFailure('Não é possível agendar em datas passadas'),
      );
    }

    // Validação de horário passado se for hoje
    if (DateTimeHelper.isToday(bookingDate)) {
      final now = TimeSlot.now();
      if (bookingTime <= now) {
        return const Left(
          ValidationFailure('Horário já passou'),
        );
      }
    }

    return await repository.createBooking(
      tenantId: tenantId.trim(),
      serviceId: serviceId.trim(),
      serviceName: serviceName,
      servicePrice: servicePrice,
      serviceDuration: serviceDuration,
      customerName: trimmedName,
      customerPhone: phone.value,
      bookingDate: bookingDate,
      bookingTime: bookingTime,
    );
  }
}
