import 'package:flutter_test/flutter_test.dart';
import 'package:quiltt_connector/event.dart';

void main() {
  group('ConnectorSDKEventType', () {
    test('each case has the correct canonical value', () {
      expect(ConnectorSDKEventType.opened.value, equals('opened'));
      expect(ConnectorSDKEventType.loaded.value, equals('loaded'));
      expect(
        ConnectorSDKEventType.exitSuccessful.value,
        equals('exited.successful'),
      );
      expect(
        ConnectorSDKEventType.exitAborted.value,
        equals('exited.aborted'),
      );
      expect(
        ConnectorSDKEventType.exitErrored.value,
        equals('exited.errored'),
      );
    });

    test('fromUrlHost maps lowercase mobile hosts to enum', () {
      expect(
        ConnectorSDKEventType.fromUrlHost('load'),
        equals(ConnectorSDKEventType.loaded),
      );
      expect(
        ConnectorSDKEventType.fromUrlHost('exitsuccess'),
        equals(ConnectorSDKEventType.exitSuccessful),
      );
      expect(
        ConnectorSDKEventType.fromUrlHost('exitabort'),
        equals(ConnectorSDKEventType.exitAborted),
      );
      expect(
        ConnectorSDKEventType.fromUrlHost('exiterror'),
        equals(ConnectorSDKEventType.exitErrored),
      );
    });

    test('fromUrlHost is case-insensitive', () {
      expect(
        ConnectorSDKEventType.fromUrlHost('ExitSuccess'),
        equals(ConnectorSDKEventType.exitSuccessful),
      );
      expect(
        ConnectorSDKEventType.fromUrlHost('EXITSUCCESS'),
        equals(ConnectorSDKEventType.exitSuccessful),
      );
    });

    test('fromUrlHost returns null for non-SDK hosts', () {
      expect(ConnectorSDKEventType.fromUrlHost('navigate'), isNull);
      expect(ConnectorSDKEventType.fromUrlHost('authenticate'), isNull);
      expect(ConnectorSDKEventType.fromUrlHost('unknown'), isNull);
    });

    test('fromValue maps canonical strings to enum', () {
      expect(
        ConnectorSDKEventType.fromValue('opened'),
        equals(ConnectorSDKEventType.opened),
      );
      expect(
        ConnectorSDKEventType.fromValue('loaded'),
        equals(ConnectorSDKEventType.loaded),
      );
      expect(
        ConnectorSDKEventType.fromValue('exited.successful'),
        equals(ConnectorSDKEventType.exitSuccessful),
      );
      expect(
        ConnectorSDKEventType.fromValue('exited.aborted'),
        equals(ConnectorSDKEventType.exitAborted),
      );
      expect(
        ConnectorSDKEventType.fromValue('exited.errored'),
        equals(ConnectorSDKEventType.exitErrored),
      );
    });

    test('fromValue returns null for unknown strings', () {
      expect(ConnectorSDKEventType.fromValue('exitsuccess'), isNull);
      expect(ConnectorSDKEventType.fromValue('ExitSuccess'), isNull);
      expect(ConnectorSDKEventType.fromValue(''), isNull);
    });
  });

  group('ConnectorSDKCallbackMetadata', () {
    test('stores all fields', () {
      final metadata = ConnectorSDKCallbackMetadata(
        connectorId: 'connector-1',
        profileId: 'profile-1',
        connectionId: 'conn-1',
      );
      expect(metadata.connectorId, equals('connector-1'));
      expect(metadata.profileId, equals('profile-1'));
      expect(metadata.connectionId, equals('conn-1'));
    });

    test('optional fields default to null', () {
      final metadata = ConnectorSDKCallbackMetadata(connectorId: 'connector-1');
      expect(metadata.connectorId, equals('connector-1'));
      expect(metadata.profileId, isNull);
      expect(metadata.connectionId, isNull);
    });
  });

  group('ConnectorSDKOnEventCallback', () {
    test('stores type and eventMetadata', () {
      final metadata = ConnectorSDKCallbackMetadata(connectorId: 'c');
      final event = ConnectorSDKOnEventCallback(
        type: ConnectorSDKEventType.loaded,
        eventMetadata: metadata,
      );
      expect(event.type, equals(ConnectorSDKEventType.loaded));
      expect(event.type.value, equals('loaded'));
      expect(event.eventMetadata, same(metadata));
    });
  });

  group('ConnectorSDKOnEventExitCallback', () {
    test('stores type and eventMetadata', () {
      final metadata = ConnectorSDKCallbackMetadata(connectorId: 'c');
      final event = ConnectorSDKOnEventExitCallback(
        type: ConnectorSDKEventType.exitSuccessful,
        eventMetadata: metadata,
      );
      expect(event.type, equals(ConnectorSDKEventType.exitSuccessful));
      expect(event.type.value, equals('exited.successful'));
      expect(event.eventMetadata, same(metadata));
    });
  });

  group('ConnectorSDKOnExitSuccessCallback', () {
    test('stores eventMetadata', () {
      final metadata = ConnectorSDKCallbackMetadata(connectorId: 'c');
      final event = ConnectorSDKOnExitSuccessCallback(eventMetadata: metadata);
      expect(event.eventMetadata, same(metadata));
    });
  });

  group('ConnectorSDKOnExitAbortCallback', () {
    test('stores eventMetadata', () {
      final metadata = ConnectorSDKCallbackMetadata(connectorId: 'c');
      final event = ConnectorSDKOnExitAbortCallback(eventMetadata: metadata);
      expect(event.eventMetadata, same(metadata));
    });
  });

  group('ConnectorSDKOnExitErrorCallback', () {
    test('stores eventMetadata', () {
      final metadata = ConnectorSDKCallbackMetadata(connectorId: 'c');
      final event = ConnectorSDKOnExitErrorCallback(eventMetadata: metadata);
      expect(event.eventMetadata, same(metadata));
    });
  });
}
