import 'package:cloud_firestore/cloud_firestore.dart';
import '../../../../core/constants/firebase_constants.dart';
import '../../../../core/errors/failures.dart';
import '../../../../shared/data/datasources/base_firebase_datasource.dart';
import '../models/availability_model.dart';
import '../models/booking_model.dart';
import 'booking_remote_datasource.dart';

/// Implementação Firebase do [BookingRemoteDatasource].
class BookingRemoteDatasourceImpl extends BaseFirebaseDatasource
    implements BookingRemoteDatasource {
  BookingRemoteDatasourceImpl({required super.firestore});

  // ==================== AVAILABILITY ====================

  @override
  Future<List<AvailabilityModel>> getAvailabilityByTenantAndDay({
    required String tenantId,
    required int dayOfWeek,
  }) async {
    try {
      logInfo(
        'getAvailabilityByTenantAndDay',
        'Buscando disponibilidade para tenant: $tenantId, dia: $dayOfWeek',
      );

      final querySnapshot = await firestore
          .collection(FirebaseConstants.availabilityCollection)
          .where('tenantId', isEqualTo: tenantId)
          .limit(1)
          .get();

      if (querySnapshot.docs.isEmpty) {
        logInfo(
          'getAvailabilityByTenantAndDay',
          'Nenhuma disponibilidade encontrada para tenant: $tenantId',
        );
        return [];
      }

      final doc = querySnapshot.docs.first;
      final data = doc.data();

      // Mapeia dayOfWeek (1-7) para nome do dia
      final dayName = _getDayName(dayOfWeek);
      logInfo('getAvailabilityByTenantAndDay', 'Dia mapeado: $dayOfWeek -> $dayName');

      final weekAvailability = data['weekAvailability'] as Map<String, dynamic>?;
      if (weekAvailability == null) {
        logWarning(
          'getAvailabilityByTenantAndDay',
          'weekAvailability não encontrado no documento',
        );
        return [];
      }

      final dayConfig = weekAvailability[dayName] as Map<String, dynamic>?;
      if (dayConfig == null) {
        logWarning(
          'getAvailabilityByTenantAndDay',
          'Configuração para $dayName não encontrada',
        );
        return [];
      }

      final enabled = dayConfig['enabled'] as bool? ?? false;
      if (!enabled) {
        logInfo('getAvailabilityByTenantAndDay', 'Dia $dayName não está habilitado');
        return [];
      }

      final timeSlot = dayConfig['timeSlot'] as Map<String, dynamic>?;
      final slotDuration = dayConfig['slotDuration'] as int? ?? 30;

      if (timeSlot == null) {
        logWarning(
          'getAvailabilityByTenantAndDay',
          'timeSlot não encontrado para $dayName',
        );
        return [];
      }

      final startTime = timeSlot['start'] as String? ?? '09:00';
      final endTime = timeSlot['end'] as String? ?? '18:00';

      logInfo(
        'getAvailabilityByTenantAndDay',
        'Disponibilidade: $startTime - $endTime (duração: $slotDuration min)',
      );

      return [
        AvailabilityModel(
          id: doc.id,
          tenantId: tenantId,
          dayOfWeek: dayOfWeek,
          startTime: startTime,
          endTime: endTime,
          slotDurationMinutes: slotDuration,
        ),
      ];
    } on FirebaseException catch (e) {
      logFirebaseError('getAvailabilityByTenantAndDay', e);
      throw ServerFailure(e.message ?? 'Erro ao buscar disponibilidade');
    } catch (e, stackTrace) {
      logError(
        'getAvailabilityByTenantAndDay',
        'ERRO INESPERADO: $e',
        e,
        stackTrace,
      );
      throw const ServerFailure('Erro ao processar disponibilidade');
    }
  }

  // ==================== BOOKINGS ====================

  @override
  Future<List<BookingModel>> getBookingsByTenantAndDate({
    required String tenantId,
    required DateTime date,
  }) async {
    try {
      logInfo(
        'getBookingsByTenantAndDate',
        'Buscando bookings para tenant: $tenantId, data: $date',
      );

      final startOfDay = DateTime(date.year, date.month, date.day);
      final endOfDay = DateTime(date.year, date.month, date.day, 23, 59, 59);

      final querySnapshot = await firestore
          .collection(FirebaseConstants.bookingsCollection)
          .where(FirebaseConstants.tenantIdField, isEqualTo: tenantId)
          .where(
            FirebaseConstants.bookingDateField,
            isGreaterThanOrEqualTo: Timestamp.fromDate(startOfDay),
          )
          .where(
            FirebaseConstants.bookingDateField,
            isLessThanOrEqualTo: Timestamp.fromDate(endOfDay),
          )
          .where(
            FirebaseConstants.statusField,
            whereIn: [
              FirebaseConstants.statusPending,
              FirebaseConstants.statusConfirmed,
            ],
          )
          .get();

      logInfo(
        'getBookingsByTenantAndDate',
        'Bookings encontrados: ${querySnapshot.docs.length}',
      );

      return querySnapshot.docs
          .map((doc) => BookingModel.fromJson(doc.data(), doc.id))
          .toList();
    } on FirebaseException catch (e) {
      logFirebaseError('getBookingsByTenantAndDate', e);
      throw ServerFailure(e.message ?? 'Erro ao buscar agendamentos');
    }
  }

  @override
  Future<BookingModel> createBooking(BookingModel booking) async {
    try {
      logInfo('createBooking', 'Criando novo agendamento');

      final docRef = await firestore
          .collection(FirebaseConstants.bookingsCollection)
          .add(booking.toJson());

      final doc = await docRef.get();
      logInfo('createBooking', 'Agendamento criado com ID: ${doc.id}');

      return BookingModel.fromJson(doc.data()!, doc.id);
    } on FirebaseException catch (e) {
      logFirebaseError('createBooking', e);
      throw ServerFailure(e.message ?? 'Erro ao criar agendamento');
    }
  }

  @override
  Future<bool> checkSlotAvailability({
    required String tenantId,
    required DateTime date,
    required String time,
  }) async {
    try {
      logInfo(
        'checkSlotAvailability',
        'Verificando slot: tenant=$tenantId, data=$date, hora=$time',
      );

      final startOfDay = DateTime(date.year, date.month, date.day);
      final endOfDay = DateTime(date.year, date.month, date.day, 23, 59, 59);

      final querySnapshot = await firestore
          .collection(FirebaseConstants.bookingsCollection)
          .where(FirebaseConstants.tenantIdField, isEqualTo: tenantId)
          .where(
            FirebaseConstants.bookingDateField,
            isGreaterThanOrEqualTo: Timestamp.fromDate(startOfDay),
          )
          .where(
            FirebaseConstants.bookingDateField,
            isLessThanOrEqualTo: Timestamp.fromDate(endOfDay),
          )
          .where(FirebaseConstants.bookingTimeField, isEqualTo: time)
          .where(
            FirebaseConstants.statusField,
            whereIn: [
              FirebaseConstants.statusPending,
              FirebaseConstants.statusConfirmed,
            ],
          )
          .get();

      final isAvailable = querySnapshot.docs.isEmpty;
      logInfo('checkSlotAvailability', 'Slot disponível: $isAvailable');

      return isAvailable;
    } on FirebaseException catch (e) {
      logFirebaseError('checkSlotAvailability', e);
      throw ServerFailure(e.message ?? 'Erro ao verificar disponibilidade');
    }
  }

  // ==================== HELPERS ====================

  String _getDayName(int dayOfWeek) {
    const dayNames = [
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
      'sunday',
    ];
    return dayNames[dayOfWeek - 1];
  }
}
