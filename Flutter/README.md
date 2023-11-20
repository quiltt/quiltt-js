# Quiltt Connector Flutter SDK

[![pub package](https://img.shields.io/pub/v/quiltt_connector.svg)](https://pub.dev/packages/quiltt_connector)

## Usage

Add `quiltt_connector` as a [dependency in your pubspec.yaml file](https://pub.dev/packages/quiltt_connector/install).

```dart
import 'package:quiltt_connector/quiltt_connector.dart';
import 'package:quiltt_connector/configuration.dart';

class _Example extends State {
  connect() {
    QuilttConnectorConfiguration config = QuilttConnectorConfiguration(
      connectorId: "connectorId",
      oauthRedirectUrl: "quilttexample://open.flutter.app");

    QuilttConnector quilttConnector = QuilttConnector();
    quilttConnector.authenticate(token); // Optional
    quilttConnector.connect(context,
      config,
      // Optional: event handler function
      onEvent: (event) {
      debugPrint("onEvent: ${event.eventMetadata}");
    }, onExit: (event) {
      debugPrint("onExit: ${event.eventMetadata}");
    }, onExitSuccess: (event) {
      debugPrint("onExitSuccess: ${event.eventMetadata}");
      _setConnectionId(event.eventMetadata.connectionId!);
    }, onExitAbort: (event) {
      debugPrint("onExitAbort: ${event.eventMetadata}");
    }, onExitError: (event) {
      debugPrint("onExitError: ${event.eventMetadata}");
    });
  }

  reconnect() {
    QuilttConnectorConfiguration config = QuilttConnectorConfiguration(
      connectorId: "connectorId",
      connectionId: "connectionId",
      oauthRedirectUrl: "quilttexample://open.flutter.app");

    QuilttConnector quilttConnector = QuilttConnector();
    quilttConnector.authenticate(token); // Optional
    quilttConnector.reconnect(context,
      config,
      // Optional: event handler function
      onEvent: (event) {
      debugPrint("onEvent: ${event.eventMetadata}");
    }, onExit: (event) {
      debugPrint("onExit: ${event.eventMetadata}");
    }, onExitSuccess: (event) {
      debugPrint("onExitSuccess: ${event.eventMetadata}");
      _setConnectionId(event.eventMetadata.connectionId!);
    }, onExitAbort: (event) {
      debugPrint("onExitAbort: ${event.eventMetadata}");
    }, onExitError: (event) {
      debugPrint("onExitError: ${event.eventMetadata}");
    });
  }

  @override
  Widget build(BuildContext context) {
    return Container();
  }
}
```
