@JS()
library;

import 'dart:js_interop';

/// JS interop bindings for the Quiltt Connector SDK.
///
/// The SDK is loaded from `https://cdn.quiltt.io/v1/connector.js`
/// and exposes a global `Quiltt` object on `window`.
@JS('Quiltt')
extension type QuilttJS._(JSObject _) implements JSObject {
  /// Sets the session token for authentication.
  external static void authenticate(JSString? token);

  /// Creates a new connector instance for the given [connectorId].
  external static QuilttConnectorJS connect(
    JSString connectorId, [
    JSObject? options,
  ]);

  /// Creates a reconnect connector instance for the given [connectorId].
  external static QuilttConnectorJS reconnect(
    JSString connectorId,
    JSObject options,
  );
}

/// A connector instance returned by [QuilttJS.connect] or
/// [QuilttJS.reconnect].
extension type QuilttConnectorJS._(JSObject _) implements JSObject {
  /// Opens the connector UI overlay.
  external void open();

  /// Registers an event callback.
  external void onEvent(JSFunction callback);

  /// Registers a load callback.
  external void onLoad(JSFunction callback);

  /// Registers an exit-success callback.
  external void onExitSuccess(JSFunction callback);

  /// Registers an exit-abort callback.
  external void onExitAbort(JSFunction callback);

  /// Registers an exit-error callback.
  external void onExitError(JSFunction callback);
}
