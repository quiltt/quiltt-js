import 'dart:async';
import 'dart:js_interop';
import 'dart:js_interop_unsafe';

import 'package:flutter/widgets.dart';
import 'package:quiltt_connector/configuration.dart';
import 'package:quiltt_connector/event.dart';

import 'quiltt_js_interop.dart';
import 'quiltt_platform_interface.dart';

/// CDN URL for the Quiltt Connector JS SDK.
const _quilttCdnUrl = 'https://cdn.quiltt.io/v1/connector.js';

/// Tracks the script loading state across instances.
bool _sdkLoaded = false;
bool _sdkLoading = false;
Completer<void>? _loadCompleter;

/// Creates the web platform connector implementation.
QuilttPlatformInterface createPlatformConnector() => QuilttConnectorWeb();

/// Web implementation of [QuilttPlatformInterface] using the Quiltt JS SDK.
///
/// Lazily loads the Quiltt Connector SDK from CDN on first use and
/// communicates with it via `dart:js_interop` extension types.
class QuilttConnectorWeb extends QuilttPlatformInterface {
  /// Loads the Quiltt JS SDK from CDN if not already loaded.
  ///
  /// Returns a [Future] that completes when the script is ready.
  /// Subsequent calls return immediately if already loaded.
  ///
  /// If the SDK was preloaded in `index.html` (detected via `window.Quiltt`),
  /// dynamic injection is skipped entirely. The recommended setup is:
  ///
  /// ```html
  /// <!-- web/index.html, before flutter_bootstrap.js -->
  /// <script src="https://cdn.quiltt.io/v1/connector.js"></script>
  /// ```
  Future<void> _ensureSDKLoaded() {
    if (_sdkLoaded) return Future.value();
    if (_sdkLoading) return _loadCompleter!.future;

    // If the SDK was preloaded in index.html, skip injection.
    if (globalContext.has('Quiltt')) {
      _sdkLoaded = true;
      return Future.value();
    }

    _sdkLoading = true;
    _loadCompleter = Completer<void>();

    final document = globalContext['document'] as JSObject;

    final script = document.callMethod<JSObject>(
      'createElement'.toJS,
      'script'.toJS,
    );
    script['src'] = _quilttCdnUrl.toJS;
    script['async'] = true.toJS;

    script.callMethod<JSAny?>(
      'addEventListener'.toJS,
      'load'.toJS,
      (() {
        _sdkLoaded = true;
        _sdkLoading = false;
        _loadCompleter?.complete();
      }).toJS,
    );

    script.callMethod<JSAny?>(
      'addEventListener'.toJS,
      'error'.toJS,
      ((JSAny event) {
        _sdkLoading = false;
        final error = 'Failed to load Quiltt SDK from $_quilttCdnUrl';
        debugPrint('Quiltt: $error');
        _loadCompleter?.completeError(error);
        _loadCompleter = null;
      }).toJS,
    );

    final head = document['head'] as JSObject;
    head.callMethod<JSObject>('appendChild'.toJS, script);

    return _loadCompleter!.future;
  }

  @override
  void authenticate(String token) {
    sessionToken = token;
    if (_sdkLoaded) {
      QuilttJS.authenticate(token.toJS);
    }
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
    _launchConnector(
      config: config,
      isReconnect: false,
      onEvent: onEvent,
      onExit: onExit,
      onExitSuccess: onExitSuccess,
      onExitAbort: onExitAbort,
      onExitError: onExitError,
    );
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
    _launchConnector(
      config: config,
      isReconnect: true,
      onEvent: onEvent,
      onExit: onExit,
      onExitSuccess: onExitSuccess,
      onExitAbort: onExitAbort,
      onExitError: onExitError,
    );
  }

  /// Launches the Quiltt Connector after ensuring the JS SDK is loaded.
  void _launchConnector({
    required QuilttConnectorConfiguration config,
    required bool isReconnect,
    Function(ConnectorSDKOnEventCallback event)? onEvent,
    Function(ConnectorSDKOnEventExitCallback event)? onExit,
    Function(ConnectorSDKOnExitSuccessCallback event)? onExitSuccess,
    Function(ConnectorSDKOnExitAbortCallback event)? onExitAbort,
    Function(ConnectorSDKOnExitErrorCallback event)? onExitError,
  }) {
    _ensureSDKLoaded()
        .then((_) {
          try {
            // Authenticate with the current session token
            if (sessionToken != null) {
              QuilttJS.authenticate(sessionToken!.toJS);
            }

            // Build the options object for the JS SDK
            final options = _buildOptions(
              config: config,
              isReconnect: isReconnect,
            );

            // Create the connector instance
            final QuilttConnectorJS connector;
            if (isReconnect) {
              connector = QuilttJS.reconnect(config.connectorId.toJS, options);
            } else {
              connector = QuilttJS.connect(config.connectorId.toJS, options);
            }

            // Register callbacks using the on* methods
            _registerCallbacks(
              connector: connector,
              connectorId: config.connectorId,
              onEvent: onEvent,
              onExit: onExit,
              onExitSuccess: onExitSuccess,
              onExitAbort: onExitAbort,
              onExitError: onExitError,
            );

            // Open the connector UI
            connector.open();
          } catch (e) {
            debugPrint('Quiltt: Error launching connector: $e');
            _fireExitError(
              connectorId: config.connectorId,
              onEvent: onEvent,
              onExit: onExit,
              onExitError: onExitError,
            );
          }
        })
        .catchError((Object error) {
          debugPrint('Quiltt: SDK load failed: $error');
          _fireExitError(
            connectorId: config.connectorId,
            onEvent: onEvent,
            onExit: onExit,
            onExitError: onExitError,
          );
        });
  }

  /// Builds the JS options object for connect/reconnect calls.
  JSObject _buildOptions({
    required QuilttConnectorConfiguration config,
    required bool isReconnect,
  }) {
    final options = <String, Object>{};

    if (isReconnect && config.connectionId != null) {
      options['connectionId'] = config.connectionId!;
    }

    if (config.institution != null) {
      options['institution'] = config.institution!;
    }

    return options.jsify() as JSObject;
  }

  /// Registers Dart callbacks on the connector instance via JS interop.
  void _registerCallbacks({
    required QuilttConnectorJS connector,
    required String connectorId,
    Function(ConnectorSDKOnEventCallback event)? onEvent,
    Function(ConnectorSDKOnEventExitCallback event)? onExit,
    Function(ConnectorSDKOnExitSuccessCallback event)? onExitSuccess,
    Function(ConnectorSDKOnExitAbortCallback event)? onExitAbort,
    Function(ConnectorSDKOnExitErrorCallback event)? onExitError,
  }) {
    if (onEvent != null) {
      connector.onEvent(
        ((JSString type, JSObject metadata) {
          final meta = _extractMetadata(metadata, connectorId);
          onEvent(
            ConnectorSDKOnEventCallback(type: type.toDart, eventMetadata: meta),
          );
        }).toJS,
      );
    }

    connector.onExitSuccess(
      ((JSObject metadata) {
        final meta = _extractMetadata(metadata, connectorId);
        onEvent?.call(
          ConnectorSDKOnEventCallback(
            type: 'exited.successful',
            eventMetadata: meta,
          ),
        );
        onExit?.call(
          ConnectorSDKOnEventExitCallback(
            type: 'exited.successful',
            eventMetadata: meta,
          ),
        );
        onExitSuccess?.call(
          ConnectorSDKOnExitSuccessCallback(eventMetadata: meta),
        );
      }).toJS,
    );

    connector.onExitAbort(
      ((JSObject metadata) {
        final meta = _extractMetadata(metadata, connectorId);
        onEvent?.call(
          ConnectorSDKOnEventCallback(
            type: 'exited.aborted',
            eventMetadata: meta,
          ),
        );
        onExit?.call(
          ConnectorSDKOnEventExitCallback(
            type: 'exited.aborted',
            eventMetadata: meta,
          ),
        );
        onExitAbort?.call(ConnectorSDKOnExitAbortCallback(eventMetadata: meta));
      }).toJS,
    );

    connector.onExitError(
      ((JSObject metadata) {
        final meta = _extractMetadata(metadata, connectorId);
        onEvent?.call(
          ConnectorSDKOnEventCallback(
            type: 'exited.errored',
            eventMetadata: meta,
          ),
        );
        onExit?.call(
          ConnectorSDKOnEventExitCallback(
            type: 'exited.errored',
            eventMetadata: meta,
          ),
        );
        onExitError?.call(ConnectorSDKOnExitErrorCallback(eventMetadata: meta));
      }).toJS,
    );

    connector.onLoad(
      ((JSObject metadata) {
        final meta = _extractMetadata(metadata, connectorId);
        onEvent?.call(
          ConnectorSDKOnEventCallback(type: 'loaded', eventMetadata: meta),
        );
      }).toJS,
    );
  }

  /// Extracts [ConnectorSDKCallbackMetadata] from a JS metadata object.
  ConnectorSDKCallbackMetadata _extractMetadata(
    JSObject? jsMetadata,
    String connectorId,
  ) {
    String? connectionId;
    String? profileId;

    if (jsMetadata != null) {
      connectionId = _jsStringOrNull(
        jsMetadata.getProperty<JSAny?>('connectionId'.toJS),
      );
      profileId = _jsStringOrNull(
        jsMetadata.getProperty<JSAny?>('profileId'.toJS),
      );
    }

    return ConnectorSDKCallbackMetadata(
      connectorId: connectorId,
      connectionId: connectionId,
      profileId: profileId,
    );
  }

  /// Fires exit-error callbacks when the SDK fails to load or encounters
  /// an error during launch.
  void _fireExitError({
    required String connectorId,
    Function(ConnectorSDKOnEventCallback event)? onEvent,
    Function(ConnectorSDKOnEventExitCallback event)? onExit,
    Function(ConnectorSDKOnExitErrorCallback event)? onExitError,
  }) {
    final metadata = ConnectorSDKCallbackMetadata(connectorId: connectorId);
    onEvent?.call(
      ConnectorSDKOnEventCallback(
        type: 'exited.errored',
        eventMetadata: metadata,
      ),
    );
    onExit?.call(
      ConnectorSDKOnEventExitCallback(
        type: 'exited.errored',
        eventMetadata: metadata,
      ),
    );
    onExitError?.call(ConnectorSDKOnExitErrorCallback(eventMetadata: metadata));
  }
}

String? _jsStringOrNull(JSAny? value) {
  final v = value;
  // The `is` checks are unreliable with js_interop, use `isA<T>()` for runtime
  // JS type narrowing
  return (v != null && v.isA<JSString>()) ? (v as JSString).toDart : null;
}
