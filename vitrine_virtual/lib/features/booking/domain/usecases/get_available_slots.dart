import 'package:dartz/dartz.dart';

import '../../../../core/domain/value_objects/time_slot.dart';
import '../../../../core/errors/failures.dart';
import '../../../../core/utils/date_time_helper.dart';
import '../repositories/availability_repository.dart';

/// Caso de uso para buscar horários disponíveis.
class GetAvailableSlots {
  final AvailabilityRepository repository;

  GetAvailableSlots({required this.repository});

  /// Executa o caso de uso.
  ///
  /// Valida se o [tenantId] não está vazio e se a [date] não é passada.
  /// Filtra horários passados se a data for hoje.
  Future<Either<Failure, List<TimeSlot>>> call({
    required String tenantId,
    required DateTime date,
  }) async {
    final trimmedTenantId = tenantId.trim();

    if (trimmedTenantId.isEmpty) {
      return const Left(ValidationFailure('ID do tenant não pode ser vazio'));
    }

    if (DateTimeHelper.isPastDate(date)) {
      return const Left(
        ValidationFailure('Não é possível agendar em datas passadas'),
      );
    }

    final result = await repository.getAvailableSlots(
      tenantId: trimmedTenantId,
      date: date,
    );

    // Se for hoje, filtra horários que já passaram
    return result.map((slots) {
      if (DateTimeHelper.isToday(date)) {
        final now = TimeSlot.now();
        // Adiciona margem de 30 minutos para o próximo slot disponível
        final minSlot = now.addMinutes(30);
        return slots.where((slot) => slot >= minSlot).toList();
      }
      return slots;
    });
  }
}
