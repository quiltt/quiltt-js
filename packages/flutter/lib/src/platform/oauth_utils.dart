import 'package:flutter/foundation.dart';
import 'package:url_launcher/url_launcher_string.dart';

import '../../event.dart';
import '../../url_utils.dart';

/// Handles opening an OAuth URL in an external browser.
///
/// Wraps the preflight/launch sequence in a try/catch so that platform-channel
/// failures (e.g. from [canLaunchUrlString] or [launchUrlString]) are handled
/// gracefully and fire [fireOAuthFailure] instead of propagating.
Future<void> handleOAuthUrl(
  String oauthUrl,
  String connectorId, {
  void Function(ConnectorSDKOnEventCallback event)? onEvent,
  void Function(ConnectorSDKOnEventExitCallback event)? onExit,
  void Function(ConnectorSDKOnExitErrorCallback event)? onExitError,
}) async {
  // Normalize the URL encoding to prevent issues with double-encoding
  final normalizedUrl = URLUtils.normalizeUrlEncoding(oauthUrl);

  try {
    // Preflight: verify the device can handle this URL scheme
    if (!await canLaunchUrlString(normalizedUrl)) {
      debugPrint('Quiltt: Cannot open OAuth URL: $normalizedUrl');
      fireOAuthFailure(
        connectorId,
        onEvent: onEvent,
        onExit: onExit,
        onExitError: onExitError,
      );
      return;
    }

    final launched = await launchUrlString(
      normalizedUrl,
      mode: LaunchMode.externalApplication,
    );

    if (!launched) {
      debugPrint('Quiltt: Failed to open OAuth URL: $normalizedUrl');
      fireOAuthFailure(
        connectorId,
        onEvent: onEvent,
        onExit: onExit,
        onExitError: onExitError,
      );
    }
  } catch (e) {
    debugPrint('Quiltt: Error opening OAuth URL: $normalizedUrl – $e');
    fireOAuthFailure(
      connectorId,
      onEvent: onEvent,
      onExit: onExit,
      onExitError: onExitError,
    );
  }
}

/// Fires exit-error callbacks to signal an OAuth failure to the host app.
void fireOAuthFailure(
  String connectorId, {
  void Function(ConnectorSDKOnEventCallback event)? onEvent,
  void Function(ConnectorSDKOnEventExitCallback event)? onExit,
  void Function(ConnectorSDKOnExitErrorCallback event)? onExitError,
}) {
  final metadata = ConnectorSDKCallbackMetadata(connectorId: connectorId);
  onEvent?.call(
    ConnectorSDKOnEventCallback(
      type: ConnectorSDKEventType.exitErrored,
      eventMetadata: metadata,
    ),
  );
  onExit?.call(
    ConnectorSDKOnEventExitCallback(
      type: ConnectorSDKEventType.exitErrored,
      eventMetadata: metadata,
    ),
  );
  onExitError?.call(ConnectorSDKOnExitErrorCallback(eventMetadata: metadata));
}
