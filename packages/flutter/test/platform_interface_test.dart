import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:quiltt_connector/configuration.dart';
import 'package:quiltt_connector/event.dart';
import 'package:quiltt_connector/src/platform/quiltt_platform_interface.dart';

/// A minimal test implementation of [QuilttPlatformInterface].
class TestPlatformConnector extends QuilttPlatformInterface {
  bool authenticateCalled = false;
  bool connectCalled = false;
  bool reconnectCalled = false;
  String? lastToken;
  QuilttConnectorConfiguration? lastConfig;

  @override
  void authenticate(String token) {
    authenticateCalled = true;
    lastToken = token;
    sessionToken = token;
  }

  @override
  void connect(
    BuildContext context,
    QuilttConnectorConfiguration config, {
    Function(ConnectorSDKOnEventCallback event)? onEvent,
    Function(ConnectorSDKOnEventExitCallback event)? onExit,
    Function(ConnectorSDKOnExitSuccessCallback event)? onExitSuccess,
    Function(ConnectorSDKOnExitAbortCallback event)? onExitAbort,
    Function(ConnectorSDKOnExitErrorCallback event)? onExitError,
  }) {
    connectCalled = true;
    lastConfig = config;
  }

  @override
  void reconnect(
    BuildContext context,
    QuilttConnectorConfiguration config, {
    Function(ConnectorSDKOnEventCallback event)? onEvent,
    Function(ConnectorSDKOnEventExitCallback event)? onExit,
    Function(ConnectorSDKOnExitSuccessCallback event)? onExitSuccess,
    Function(ConnectorSDKOnExitAbortCallback event)? onExitAbort,
    Function(ConnectorSDKOnExitErrorCallback event)? onExitError,
  }) {
    reconnectCalled = true;
    lastConfig = config;
  }
}

void main() {
  group('QuilttPlatformInterface', () {
    test('sessionToken is initially null', () {
      final platform = TestPlatformConnector();
      expect(platform.sessionToken, isNull);
    });

    test('authenticate sets sessionToken', () {
      final platform = TestPlatformConnector();
      platform.authenticate('test-token');
      expect(platform.authenticateCalled, isTrue);
      expect(platform.sessionToken, equals('test-token'));
      expect(platform.lastToken, equals('test-token'));
    });

    test('sessionToken can be set directly', () {
      final platform = TestPlatformConnector();
      platform.sessionToken = 'direct-token';
      expect(platform.sessionToken, equals('direct-token'));
    });

    testWidgets('interface contract: connect and reconnect are callable', (
      tester,
    ) async {
      final platform = TestPlatformConnector();
      final config = QuilttConnectorConfiguration(
        connectorId: 'test',
        appLauncherUrl: 'https://app.quiltt.io',
      );

      expect(platform.connectCalled, isFalse);
      expect(platform.reconnectCalled, isFalse);

      late BuildContext ctx;
      await tester.pumpWidget(
        Builder(
          builder: (c) {
            ctx = c;
            return const SizedBox();
          },
        ),
      );

      platform.connect(ctx, config);
      expect(platform.connectCalled, isTrue);
      expect(platform.lastConfig, equals(config));

      final reconnectConfig = QuilttConnectorConfiguration(
        connectorId: 'test',
        appLauncherUrl: 'https://app.quiltt.io',
        connectionId: 'conn-123',
      );
      platform.reconnect(ctx, reconnectConfig);
      expect(platform.reconnectCalled, isTrue);
      expect(platform.lastConfig, equals(reconnectConfig));
    });

    test('test implementation can be used polymorphically', () {
      final QuilttPlatformInterface platform = TestPlatformConnector();
      platform.authenticate('poly-token');
      expect(platform.sessionToken, equals('poly-token'));
    });
  });

  group('QuilttPlatformInterface authenticate', () {
    test('authenticate stores token via platform', () {
      final platform = TestPlatformConnector();
      platform.authenticate('facade-token');
      expect(platform.sessionToken, equals('facade-token'));
      expect(platform.authenticateCalled, isTrue);
    });

    test('multiple authenticate calls update token', () {
      final platform = TestPlatformConnector();
      platform.authenticate('first');
      expect(platform.sessionToken, equals('first'));
      platform.authenticate('second');
      expect(platform.sessionToken, equals('second'));
    });

    test('sessionToken setter bypasses authenticate', () {
      final platform = TestPlatformConnector();
      platform.sessionToken = 'direct';
      expect(platform.sessionToken, equals('direct'));
      expect(platform.authenticateCalled, isFalse);
    });

    test('sessionToken can be cleared to null', () {
      final platform = TestPlatformConnector();
      platform.authenticate('temp');
      platform.sessionToken = null;
      expect(platform.sessionToken, isNull);
    });
  });
}

// Note: QuilttConnector cannot be instantiated in unit tests because the
// mobile implementation requires a webview_flutter platform. The
// TestPlatformConnector above validates the Dart-side plumbing and
// interface contract without requiring platform plugins.
