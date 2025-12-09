import 'dart:developer' as developer;
import 'package:cloud_firestore/cloud_firestore.dart';
import '../../core/constants/firebase_constants.dart';
import '../../core/errors/failures.dart';
import '../models/tenant_model.dart';
import '../models/service_model.dart';
import '../models/availability_model.dart';
import '../models/booking_model.dart';

class FirebaseDatasource {
  final FirebaseFirestore firestore;

  FirebaseDatasource({required this.firestore});

  Future<TenantModel> getTenantBySubdomain(String subdomain) async {
    try {
      developer.log(
        'Buscando tenant com subdomain: $subdomain',
        name: 'FirebaseDatasource',
      );

      final querySnapshot = await firestore
          .collection(FirebaseConstants.tenantsCollection)
          .where(FirebaseConstants.subdomainField, isEqualTo: subdomain)
          .limit(1)
          .get();

      developer.log(
        'Documentos encontrados: ${querySnapshot.docs.length}',
        name: 'FirebaseDatasource',
      );

      if (querySnapshot.docs.isEmpty) {
        developer.log(
          'ERRO: Tenant não encontrado para subdomain: $subdomain',
          name: 'FirebaseDatasource',
          level: 1000,
        );
        throw const NotFoundFailure('Tenant não encontrado');
      }

      final doc = querySnapshot.docs.first;
      developer.log(
        'Tenant encontrado: ID=${doc.id}',
        name: 'FirebaseDatasource',
      );
      return TenantModel.fromJson(doc.data(), doc.id);
    } on FirebaseException catch (e) {
      developer.log(
        '========================================',
        name: 'FirebaseDatasource',
        level: 1000,
      );
      developer.log(
        'ERRO FIREBASE DETECTADO',
        name: 'FirebaseDatasource',
        level: 1000,
      );
      developer.log(
        'Código: ${e.code}',
        name: 'FirebaseDatasource',
        level: 1000,
      );
      developer.log(
        'Mensagem completa:',
        name: 'FirebaseDatasource',
        level: 1000,
      );
      developer.log(
        e.message ?? 'Sem mensagem',
        name: 'FirebaseDatasource',
        level: 1000,
      );
      developer.log(
        '========================================',
        name: 'FirebaseDatasource',
        level: 1000,
      );
      throw ServerFailure(e.message ?? 'Erro ao buscar tenant');
    } catch (e, stackTrace) {
      developer.log(
        'ERRO INESPERADO: $e',
        name: 'FirebaseDatasource',
        error: e,
        stackTrace: stackTrace,
        level: 1000,
      );
      rethrow;
    }
  }

  Future<List<ServiceModel>> getServicesByTenantId(String tenantId) async {
    try {
      print('🔥🔥🔥 BUSCANDO SERVIÇOS PARA TENANT: $tenantId');
      print('🔥 Collection: ${FirebaseConstants.servicesCollection}');
      print('🔥 Field tenantId: ${FirebaseConstants.tenantIdField}');
      print('🔥 Field active: ${FirebaseConstants.isActiveField}');

      final querySnapshot = await firestore
          .collection(FirebaseConstants.servicesCollection)
          .where(FirebaseConstants.tenantIdField, isEqualTo: tenantId)
          .where(FirebaseConstants.isActiveField, isEqualTo: true)
          .orderBy(FirebaseConstants.createdAtField, descending: false)
          .get();

      print('🔥 Documentos de serviços encontrados: ${querySnapshot.docs.length}');

      if (querySnapshot.docs.isEmpty) {
        print('⚠️ NENHUM SERVIÇO ENCONTRADO!');
        print('⚠️ Verifique:');
        print('   - tenantId no Firestore está como: PHtMoDffqKfaCs9RfDMF');
        print('   - Campo active está como: true');
        print('   - Campo tenantId está como: tenantId (camelCase)');
      } else {
        print('✅ Serviços encontrados:');
        for (var doc in querySnapshot.docs) {
          print('   - ${doc.data()}');
        }
      }

      return querySnapshot.docs
          .map((doc) => ServiceModel.fromJson(doc.data(), doc.id))
          .toList();
    } on FirebaseException catch (e) {
      print('🔥 ERRO FIREBASE: ${e.code}');
      print('🔥 Mensagem: ${e.message}');
      developer.log(
        '========================================',
        name: 'FirebaseDatasource.getServices',
        level: 1000,
      );
      developer.log(
        'ERRO FIREBASE: ${e.code}',
        name: 'FirebaseDatasource.getServices',
        level: 1000,
      );
      developer.log(
        e.message ?? 'Sem mensagem',
        name: 'FirebaseDatasource.getServices',
        level: 1000,
      );
      developer.log(
        '========================================',
        name: 'FirebaseDatasource.getServices',
        level: 1000,
      );
      throw ServerFailure(e.message ?? 'Erro ao buscar serviços');
    }
  }

  Future<ServiceModel> getServiceById(String serviceId) async {
    try {
      final doc = await firestore
          .collection(FirebaseConstants.servicesCollection)
          .doc(serviceId)
          .get();

      if (!doc.exists) {
        throw const NotFoundFailure('Serviço não encontrado');
      }

      return ServiceModel.fromJson(doc.data()!, doc.id);
    } on FirebaseException catch (e) {
      developer.log(
        '========================================',
        name: 'FirebaseDatasource.getServiceById',
        level: 1000,
      );
      developer.log(
        'ERRO FIREBASE: ${e.code}',
        name: 'FirebaseDatasource.getServiceById',
        level: 1000,
      );
      developer.log(
        e.message ?? 'Sem mensagem',
        name: 'FirebaseDatasource.getServiceById',
        level: 1000,
      );
      developer.log(
        '========================================',
        name: 'FirebaseDatasource.getServiceById',
        level: 1000,
      );
      throw ServerFailure(e.message ?? 'Erro ao buscar serviço');
    }
  }

  Future<List<AvailabilityModel>> getAvailabilityByTenantAndDay({
    required String tenantId,
    required int dayOfWeek,
  }) async {
    try {
      developer.log(
        'Buscando disponibilidade para tenant: $tenantId, dia: $dayOfWeek',
        name: 'FirebaseDatasource.getAvailability',
      );

      // Buscar documento de disponibilidade por tenantId
      // Nota: O painel admin Next.js salva usando camelCase (tenantId)
      final querySnapshot = await firestore
          .collection(FirebaseConstants.availabilityCollection)
          .where('tenantId', isEqualTo: tenantId)
          .limit(1)
          .get();

      if (querySnapshot.docs.isEmpty) {
        developer.log(
          'Nenhuma disponibilidade encontrada para tenant: $tenantId',
          name: 'FirebaseDatasource.getAvailability',
        );
        return [];
      }

      final doc = querySnapshot.docs.first;
      final data = doc.data();

      // Converter dayOfWeek (1-7) para nome do dia em inglês
      // 1=monday, 2=tuesday, 3=wednesday, 4=thursday, 5=friday, 6=saturday, 7=sunday
      final dayNames = [
        'monday',
        'tuesday',
        'wednesday',
        'thursday',
        'friday',
        'saturday',
        'sunday'
      ];
      final dayName = dayNames[dayOfWeek - 1];

      developer.log(
        'Dia da semana mapeado: $dayOfWeek -> $dayName',
        name: 'FirebaseDatasource.getAvailability',
      );

      // Extrair weekAvailability do documento
      final weekAvailability = data['weekAvailability'] as Map<String, dynamic>?;

      if (weekAvailability == null) {
        developer.log(
          'weekAvailability não encontrado no documento',
          name: 'FirebaseDatasource.getAvailability',
          level: 900,
        );
        return [];
      }

      // Extrair configuração do dia específico
      final dayConfig = weekAvailability[dayName] as Map<String, dynamic>?;

      if (dayConfig == null) {
        developer.log(
          'Configuração para $dayName não encontrada',
          name: 'FirebaseDatasource.getAvailability',
          level: 900,
        );
        return [];
      }

      // Verificar se o dia está habilitado
      final enabled = dayConfig['enabled'] as bool? ?? false;

      if (!enabled) {
        developer.log(
          'Dia $dayName não está habilitado',
          name: 'FirebaseDatasource.getAvailability',
        );
        return [];
      }

      // Extrair timeSlot e slotDuration
      final timeSlot = dayConfig['timeSlot'] as Map<String, dynamic>?;
      final slotDuration = dayConfig['slotDuration'] as int? ?? 30;

      if (timeSlot == null) {
        developer.log(
          'timeSlot não encontrado para $dayName',
          name: 'FirebaseDatasource.getAvailability',
          level: 900,
        );
        return [];
      }

      final startTime = timeSlot['start'] as String? ?? '09:00';
      final endTime = timeSlot['end'] as String? ?? '18:00';

      developer.log(
        'Disponibilidade encontrada: $startTime - $endTime (duração: $slotDuration min)',
        name: 'FirebaseDatasource.getAvailability',
      );

      // Criar AvailabilityModel com os dados extraídos
      final availability = AvailabilityModel(
        id: doc.id,
        tenantId: tenantId,
        dayOfWeek: dayOfWeek,
        startTime: startTime,
        endTime: endTime,
        slotDurationMinutes: slotDuration,
      );

      return [availability];
    } on FirebaseException catch (e) {
      print('');
      print('🔥🔥🔥 ERRO FIREBASE - getAvailability 🔥🔥🔥');
      print('🔥 Código: ${e.code}');
      print('🔥 Mensagem completa:');
      print('${e.message}');
      print('🔥🔥🔥 FIM DO ERRO 🔥🔥🔥');
      print('');
      developer.log(
        '========================================',
        name: 'FirebaseDatasource.getAvailability',
        level: 1000,
      );
      developer.log(
        'ERRO FIREBASE: ${e.code}',
        name: 'FirebaseDatasource.getAvailability',
        level: 1000,
      );
      developer.log(
        e.message ?? 'Sem mensagem',
        name: 'FirebaseDatasource.getAvailability',
        level: 1000,
      );
      developer.log(
        '========================================',
        name: 'FirebaseDatasource.getAvailability',
        level: 1000,
      );
      throw ServerFailure(e.message ?? 'Erro ao buscar disponibilidade');
    } catch (e, stackTrace) {
      print('');
      print('⚠️⚠️⚠️ ERRO INESPERADO - getAvailability ⚠️⚠️⚠️');
      print('$e');
      print('⚠️⚠️⚠️ FIM DO ERRO ⚠️⚠️⚠️');
      print('');
      developer.log(
        'ERRO INESPERADO ao processar disponibilidade: $e',
        name: 'FirebaseDatasource.getAvailability',
        error: e,
        stackTrace: stackTrace,
        level: 1000,
      );
      throw ServerFailure('Erro ao processar disponibilidade');
    }
  }

  Future<List<BookingModel>> getBookingsByTenantAndDate({
    required String tenantId,
    required DateTime date,
  }) async {
    try {
      print('📅📅📅 BUSCANDO BOOKINGS 📅📅📅');
      print('📅 TenantId: $tenantId');
      print('📅 Data: $date');
      print('📅 Collection: ${FirebaseConstants.bookingsCollection}');
      print('📅 Field tenantId: ${FirebaseConstants.tenantIdField}');
      print('📅 Field bookingDate: ${FirebaseConstants.bookingDateField}');
      print('📅 Field status: ${FirebaseConstants.statusField}');

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

      print('📅 Bookings encontrados: ${querySnapshot.docs.length}');

      return querySnapshot.docs
          .map((doc) => BookingModel.fromJson(doc.data(), doc.id))
          .toList();
    } on FirebaseException catch (e) {
      print('');
      print('🔥🔥🔥 ERRO FIREBASE - getBookings 🔥🔥🔥');
      print('🔥 Código: ${e.code}');
      print('🔥 Mensagem completa (COPIE O LINK ABAIXO):');
      print('${e.message}');
      print('🔥🔥🔥 FIM DO ERRO 🔥🔥🔥');
      print('');
      developer.log(
        '========================================',
        name: 'FirebaseDatasource.getBookings',
        level: 1000,
      );
      developer.log(
        'ERRO FIREBASE: ${e.code}',
        name: 'FirebaseDatasource.getBookings',
        level: 1000,
      );
      developer.log(
        e.message ?? 'Sem mensagem',
        name: 'FirebaseDatasource.getBookings',
        level: 1000,
      );
      developer.log(
        '========================================',
        name: 'FirebaseDatasource.getBookings',
        level: 1000,
      );
      throw ServerFailure(e.message ?? 'Erro ao buscar agendamentos');
    }
  }

  Future<BookingModel> createBooking(BookingModel booking) async {
    try {
      final docRef = await firestore
          .collection(FirebaseConstants.bookingsCollection)
          .add(booking.toJson());

      final doc = await docRef.get();
      return BookingModel.fromJson(doc.data()!, doc.id);
    } on FirebaseException catch (e) {
      developer.log(
        '========================================',
        name: 'FirebaseDatasource.createBooking',
        level: 1000,
      );
      developer.log(
        'ERRO FIREBASE: ${e.code}',
        name: 'FirebaseDatasource.createBooking',
        level: 1000,
      );
      developer.log(
        e.message ?? 'Sem mensagem',
        name: 'FirebaseDatasource.createBooking',
        level: 1000,
      );
      developer.log(
        '========================================',
        name: 'FirebaseDatasource.createBooking',
        level: 1000,
      );
      throw ServerFailure(e.message ?? 'Erro ao criar agendamento');
    }
  }

  Future<bool> checkSlotAvailability({
    required String tenantId,
    required DateTime date,
    required String time,
  }) async {
    try {
      print('🕐🕐🕐 CHECK SLOT AVAILABILITY 🕐🕐🕐');
      print('🕐 TenantId: $tenantId');
      print('🕐 Data: $date');
      print('🕐 Horário: $time');

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

      print('🕐 Slot disponível: ${querySnapshot.docs.isEmpty}');

      return querySnapshot.docs.isEmpty;
    } on FirebaseException catch (e) {
      print('');
      print('🔥🔥🔥 ERRO FIREBASE - checkSlotAvailability 🔥🔥🔥');
      print('🔥 Código: ${e.code}');
      print('🔥 Mensagem completa (COPIE O LINK ABAIXO):');
      print('${e.message}');
      print('🔥🔥🔥 FIM DO ERRO 🔥🔥🔥');
      print('');
      developer.log(
        '========================================',
        name: 'FirebaseDatasource.checkSlot',
        level: 1000,
      );
      developer.log(
        'ERRO FIREBASE: ${e.code}',
        name: 'FirebaseDatasource.checkSlot',
        level: 1000,
      );
      developer.log(
        e.message ?? 'Sem mensagem',
        name: 'FirebaseDatasource.checkSlot',
        level: 1000,
      );
      developer.log(
        '========================================',
        name: 'FirebaseDatasource.checkSlot',
        level: 1000,
      );
      throw ServerFailure(e.message ?? 'Erro ao verificar disponibilidade');
    }
  }
}
