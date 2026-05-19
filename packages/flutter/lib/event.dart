/// Canonical event type values matching the Quiltt Connector JS SDK.
///
/// Values are identical to the `ConnectorSDKEventType` enum in `@quiltt/core`
/// and are consistent across mobile and web platforms.
///
/// The mobile WebView receives PascalCase URL-scheme hosts from the connector
/// web app (e.g. `quilttconnector://ExitSuccess`). [fromUrlHost] maps these to
/// the correct enum case — the same pattern used by the iOS and Android SDKs.
enum ConnectorSDKEventType {
  opened('opened'),
  loaded('loaded'),
  exitSuccessful('exited.successful'),
  exitAborted('exited.aborted'),
  exitErrored('exited.errored');

  const ConnectorSDKEventType(this.value);

  /// The canonical string value used by the Quiltt JS SDK.
  final String value;

  /// Maps a PascalCase URL-scheme host (as received from the WebView on mobile)
  /// to the corresponding [ConnectorSDKEventType].
  ///
  /// Returns `null` for non-SDK hosts such as `Navigate` or `Authenticate`.
  static ConnectorSDKEventType? fromUrlHost(String host) => switch (host) {
    'Load' => ConnectorSDKEventType.loaded,
    'ExitSuccess' => ConnectorSDKEventType.exitSuccessful,
    'ExitAbort' => ConnectorSDKEventType.exitAborted,
    'ExitError' => ConnectorSDKEventType.exitErrored,
    _ => null,
  };

  /// Parses a canonical string value back to [ConnectorSDKEventType].
  ///
  /// Returns `null` for unknown values.
  static ConnectorSDKEventType? fromValue(String value) {
    for (final type in ConnectorSDKEventType.values) {
      if (type.value == value) return type;
    }
    return null;
  }
}

/// Metadata included with every Connector SDK callback event.
class ConnectorSDKCallbackMetadata {
  /// The ID of the connector that triggered the event.
  String connectorId;

  /// The connection ID associated with the event, if available.
  String? connectionId;

  /// The profile ID associated with the event, if available.
  String? profileId;

  /// Creates a [ConnectorSDKCallbackMetadata] instance.
  ConnectorSDKCallbackMetadata({
    required this.connectorId,
    this.connectionId,
    this.profileId,
  });
}

/// Callback payload delivered for intermediate Connector events.
class ConnectorSDKOnEventCallback {
  /// The event type.
  ConnectorSDKEventType type;

  /// Metadata associated with the event.
  ConnectorSDKCallbackMetadata eventMetadata;

  /// Creates a [ConnectorSDKOnEventCallback] instance.
  ConnectorSDKOnEventCallback({
    required this.type,
    required this.eventMetadata,
  });
}

/// Callback payload delivered when the Connector exits via an event.
class ConnectorSDKOnEventExitCallback {
  /// The exit event type.
  ConnectorSDKEventType type;

  /// Metadata associated with the exit event.
  ConnectorSDKCallbackMetadata eventMetadata;

  /// Creates a [ConnectorSDKOnEventExitCallback] instance.
  ConnectorSDKOnEventExitCallback({
    required this.type,
    required this.eventMetadata,
  });
}

/// Callback payload delivered when the Connector exits after a successful connection.
class ConnectorSDKOnExitSuccessCallback {
  /// Metadata for the successful connection.
  ConnectorSDKCallbackMetadata eventMetadata;

  /// Creates a [ConnectorSDKOnExitSuccessCallback] instance.
  ConnectorSDKOnExitSuccessCallback({required this.eventMetadata});
}

/// Callback payload delivered when the user aborts the Connector flow.
class ConnectorSDKOnExitAbortCallback {
  /// Metadata for the aborted session.
  ConnectorSDKCallbackMetadata eventMetadata;

  /// Creates a [ConnectorSDKOnExitAbortCallback] instance.
  ConnectorSDKOnExitAbortCallback({required this.eventMetadata});
}

/// Callback payload delivered when the Connector exits with an error.
class ConnectorSDKOnExitErrorCallback {
  /// Metadata for the errored session.
  ConnectorSDKCallbackMetadata eventMetadata;

  /// Creates a [ConnectorSDKOnExitErrorCallback] instance.
  ConnectorSDKOnExitErrorCallback({required this.eventMetadata});
}
