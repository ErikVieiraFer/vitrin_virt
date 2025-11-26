import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:vitrine_virtual/main.dart';

void main() {
  testWidgets('App starts with VitrinaVirtualApp', (WidgetTester tester) async {
    await tester.pumpWidget(const VitrinaVirtualApp());

    expect(find.byType(MaterialApp), findsOneWidget);
  });
}
