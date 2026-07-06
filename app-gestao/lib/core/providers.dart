import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:cloud_functions/cloud_functions.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'models/agendamento.dart';
import 'models/profissional.dart';
import 'models/servico.dart';
import 'models/tenant.dart';

final firebaseAuthProvider = Provider<FirebaseAuth>((_) => FirebaseAuth.instance);
final firestoreProvider = Provider<FirebaseFirestore>((_) => FirebaseFirestore.instance);
final functionsProvider = Provider<FirebaseFunctions>(
  (_) => FirebaseFunctions.instanceFor(region: 'southamerica-east1'),
);

final authStateProvider = StreamProvider<User?>(
  (ref) => ref.watch(firebaseAuthProvider).authStateChanges(),
);

/// tenantId vem dos custom claims setados pela Cloud Function criarConta.
final tenantIdProvider = FutureProvider<String?>((ref) async {
  final user = ref.watch(authStateProvider).value;
  if (user == null) return null;
  final token = await user.getIdTokenResult(true);
  return token.claims?['tenantId'] as String?;
});

final tenantProvider = StreamProvider<Tenant?>((ref) {
  final tenantId = ref.watch(tenantIdProvider).value;
  if (tenantId == null) return Stream.value(null);
  return ref
      .watch(firestoreProvider)
      .collection('tenants')
      .doc(tenantId)
      .snapshots()
      .map((doc) => doc.exists ? Tenant.fromDoc(doc) : null);
});

final servicosProvider = StreamProvider<List<Servico>>((ref) {
  final tenantId = ref.watch(tenantIdProvider).value;
  if (tenantId == null) return Stream.value(const []);
  return ref
      .watch(firestoreProvider)
      .collection('tenants')
      .doc(tenantId)
      .collection('servicos')
      .orderBy('nome')
      .snapshots()
      .map((snap) => snap.docs.map(Servico.fromDoc).toList());
});

/// Agendamentos de um dia (00:00–24:00 local).
final agendamentosDoDiaProvider =
    StreamProvider.family<List<Agendamento>, DateTime>((ref, dia) {
  final tenantId = ref.watch(tenantIdProvider).value;
  if (tenantId == null) return Stream.value(const []);
  final inicio = DateTime(dia.year, dia.month, dia.day);
  final fim = inicio.add(const Duration(days: 1));
  return ref
      .watch(firestoreProvider)
      .collection('tenants')
      .doc(tenantId)
      .collection('agendamentos')
      .where('inicio', isGreaterThanOrEqualTo: Timestamp.fromDate(inicio))
      .where('inicio', isLessThan: Timestamp.fromDate(fim))
      .orderBy('inicio')
      .snapshots()
      .map((snap) => snap.docs.map(Agendamento.fromDoc).toList());
});

final profissionaisProvider = StreamProvider<List<Profissional>>((ref) {
  final tenantId = ref.watch(tenantIdProvider).value;
  if (tenantId == null) return Stream.value(const []);
  return ref
      .watch(firestoreProvider)
      .collection('tenants')
      .doc(tenantId)
      .collection('profissionais')
      .orderBy('nome')
      .snapshots()
      .map((snap) => snap.docs.map(Profissional.fromDoc).toList());
});
