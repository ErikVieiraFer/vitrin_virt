import 'package:dartz/dartz.dart';

import '../../../../core/domain/value_objects/time_slot.dart';
import '../../../../core/errors/failures.dart';

/// Interface abstrata para o repositório de disponibilidade.
///
/// Retorna [TimeSlot] value objects para tipagem forte.
abstract class AvailabilityRepository {
  /// Busca os horários disponíveis para uma data específica.
  ///
  /// Retorna [Right] com lista de [TimeSlot] disponíveis.
  /// Retorna [Left] com [Failure] em caso de erro.
  Future<Either<Failure, List<TimeSlot>>> getAvailableSlots({
    required String tenantId,
    required DateTime date,
  });
}
