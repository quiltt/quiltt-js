import 'package:flutter_test/flutter_test.dart';

import 'package:example/main.dart';

void main() {
  testWidgets('app renders', (WidgetTester tester) async {
    await tester.pumpWidget(const MyApp());
    expect(find.text('Quiltt Connector Home'), findsOneWidget);
    expect(find.text('Connection ID: No connection Id yet'), findsOneWidget);
  });
}
