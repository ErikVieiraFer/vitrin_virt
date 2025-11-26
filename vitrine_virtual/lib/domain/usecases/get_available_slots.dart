import 'package:dartz/dartz.dart';
import '../../core/errors/failures.dart';
import '../../core/utils/date_time_helper.dart';
import '../../data/repositories/availability_repository.dart';

class GetAvailableSlots {
  final AvailabilityRepository repository;

  GetAvailableSlots({required this.repository});

  Future<Either<Failure, List<String>>> call({
    required String tenantId,
    required DateTime date,
  }) async {
    if (tenantId.trim().isEmpty) {
      return const Left(ValidationFailure('ID do tenant não pode ser vazio'));
    }

    if (DateTimeHelper.isPastDate(date)) {
      return const Left(ValidationFailure('Não é possível agendar em datas passadas'));
    }

    return await repository.getAvailableSlots(
      tenantId: tenantId,
      date: date,
    );
  }
}
