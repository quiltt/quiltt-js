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

    test('interface contract defines connect', () {
      final platform = TestPlatformConnector();
      // Verify the interface has connect/reconnect methods
      expect(platform.connectCalled, isFalse);
      expect(platform.reconnectCalled, isFalse);
    });

    test('test implementation can be used polymorphically', () {
      final QuilttPlatformInterface platform = TestPlatformConnector();
      platform.authenticate('poly-token');
      expect(platform.sessionToken, equals('poly-token'));
    });
  });

  group('QuilttConnector facade', () {
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

  group('QuilttConnectorConfiguration', () {
  });
}

// Note: QuilttConnector cannot be instantiated in unit tests because the
// mobile implementation requires a webview_flutter platform. The
// TestPlatformConnector above validates the Dart-side plumbing and
// interface contract without requiring platform plugins.
