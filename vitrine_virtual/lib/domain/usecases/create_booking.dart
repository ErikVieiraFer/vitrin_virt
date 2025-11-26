import 'package:dartz/dartz.dart';
import '../../core/errors/failures.dart';
import '../../core/utils/date_time_helper.dart';
import '../../core/utils/validators.dart';
import '../../data/models/booking_model.dart';
import '../../data/repositories/booking_repository.dart';

class CreateBooking {
  final BookingRepository repository;

  CreateBooking({required this.repository});

  Future<Either<Failure, BookingModel>> call({
    required String tenantId,
    required String serviceId,
    required String customerName,
    required String customerPhone,
    required DateTime bookingDate,
    required String bookingTime,
  }) async {
    final nameError = Validators.validateName(customerName);
    if (nameError != null) {
      return Left(ValidationFailure(nameError));
    }

    final phoneError = Validators.validatePhone(customerPhone);
    if (phoneError != null) {
      return Left(ValidationFailure(phoneError));
    }

    if (tenantId.trim().isEmpty) {
      return const Left(ValidationFailure('ID do tenant não pode ser vazio'));
    }

    if (serviceId.trim().isEmpty) {
      return const Left(ValidationFailure('ID do serviço não pode ser vazio'));
    }

    if (DateTimeHelper.isPastDate(bookingDate)) {
      return const Left(
        ValidationFailure('Não é possível agendar em datas passadas'),
      );
    }

    if (bookingTime.trim().isEmpty) {
      return const Left(ValidationFailure('Horário não pode ser vazio'));
    }

    return await repository.createBooking(
      tenantId: tenantId,
      serviceId: serviceId,
      customerName: customerName.trim(),
      customerPhone: customerPhone,
      bookingDate: bookingDate,
      bookingTime: bookingTime,
    );
  }
}
