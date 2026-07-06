import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:firebase_messaging/firebase_messaging.dart';

/// Registra o token FCM do dispositivo em users/{uid}.fcmTokens.
/// Chamado após o login; falhas são silenciosas (push é best-effort).
Future<void> registrarPush() async {
  try {
    final user = FirebaseAuth.instance.currentUser;
    if (user == null) return;

    final messaging = FirebaseMessaging.instance;
    final permissao = await messaging.requestPermission();
    if (permissao.authorizationStatus == AuthorizationStatus.denied) return;

    final token = await messaging.getToken();
    if (token == null) return;

    await FirebaseFirestore.instance.collection('users').doc(user.uid).set({
      'fcmTokens': FieldValue.arrayUnion([token]),
    }, SetOptions(merge: true));

    FirebaseMessaging.instance.onTokenRefresh.listen((novo) {
      FirebaseFirestore.instance.collection('users').doc(user.uid).set({
        'fcmTokens': FieldValue.arrayUnion([novo]),
      }, SetOptions(merge: true));
    });
  } catch (_) {
    // Sem push não é erro fatal.
  }
}
