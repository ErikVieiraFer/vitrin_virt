import '../models/availability_model.dart';
import '../models/booking_model.dart';

/// Interface abstrata para datasource remoto de Booking.
///
/// Define o contrato para operações de agendamento e disponibilidade.
abstract class BookingRemoteDatasource {
  // ==================== AVAILABILITY ====================

  /// Busca disponibilidade de um tenant para um dia da semana.
  ///
  /// [dayOfWeek] deve ser de 1 (segunda) a 7 (domingo).
  Future<List<AvailabilityModel>> getAvailabilityByTenantAndDay({
    required String tenantId,
    required int dayOfWeek,
  });

  // ==================== BOOKINGS ====================

  /// Busca agendamentos de um tenant em uma data específica.
  ///
  /// Retorna apenas bookings com status 'pending' ou 'confirmed'.
  Future<List<BookingModel>> getBookingsByTenantAndDate({
    required String tenantId,
    required DateTime date,
  });

  /// Cria um novo agendamento.
  Future<BookingModel> createBooking(BookingModel booking);

  /// Verifica se um horário está disponível para agendamento.
  ///
  /// Retorna `true` se o slot estiver livre.
  Future<bool> checkSlotAvailability({
    required String tenantId,
    required DateTime date,
    required String time,
  });
}
