import 'package:flutter/widgets.dart';
import 'package:quiltt_connector/configuration.dart';
import 'package:quiltt_connector/event.dart';

/// Abstract interface defining the platform-specific connector contract.
///
/// Each platform (mobile, web) provides a concrete implementation that
/// is selected at compile time via conditional imports.
abstract class QuilttPlatformInterface {
  /// The current session token used for authentication.
  String? sessionToken;

  /// Pass token to authenticate, authenticate through UI if token is absent.
  void authenticate(String token);

  /// Connect to a connector.
  ///
  /// [context] is used by the mobile implementation to push a Navigator route.
  /// On web, the JS SDK manages its own full-window overlay and [context] is
  /// ignored.
  ///
  /// **Event types**: [onExitSuccess], [onExitAbort], and [onExitError] are the
  /// normalised cross-platform callbacks. The [onEvent] and [onExit] callbacks
  /// carry a typed [ConnectorSDKEventType] value — the same canonical enum on
  /// both mobile and web.
  void connect(
    BuildContext context,
    QuilttConnectorConfiguration config, {
    Function(ConnectorSDKOnEventCallback event)? onEvent,
    Function(ConnectorSDKOnEventExitCallback event)? onExit,
    Function(ConnectorSDKOnExitSuccessCallback event)? onExitSuccess,
    Function(ConnectorSDKOnExitAbortCallback event)? onExitAbort,
    Function(ConnectorSDKOnExitErrorCallback event)? onExitError,
  });

  /// Reconnect to an existing connection.
  ///
  /// [context] is used by the mobile implementation to push a Navigator route.
  /// On web, the JS SDK manages its own full-window overlay and [context] is
  /// ignored.
  ///
  /// See [connect] for notes on event type semantics and callback behaviour.
  void reconnect(
    BuildContext context,
    QuilttConnectorConfiguration config, {
    Function(ConnectorSDKOnEventCallback event)? onEvent,
    Function(ConnectorSDKOnEventExitCallback event)? onExit,
    Function(ConnectorSDKOnExitSuccessCallback event)? onExitSuccess,
    Function(ConnectorSDKOnExitAbortCallback event)? onExitAbort,
    Function(ConnectorSDKOnExitErrorCallback event)? onExitError,
  });
}
