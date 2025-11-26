import 'package:cloud_firestore/cloud_firestore.dart';

void main() async {
  // Este script ajuda a debugar a disponibilidade
  print('=== DEBUG AVAILABILITY ===');
  print('Execute este script para ver os dados de disponibilidade no Firestore');
  print('');
  print('Copie e cole este código no console do navegador (DevTools):');
  print('');
  print('javascript:');
  print('firebase.firestore().collection("availability").get().then(snapshot => {');
  print('  snapshot.docs.forEach(doc => {');
  print('    console.log("Doc ID:", doc.id);');
  print('    console.log("Data:", JSON.stringify(doc.data(), null, 2));');
  print('  });');
  print('});');
}
