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
  void connect(
    BuildContext context,
    QuilttConnectorConfiguration config, {
    Function(ConnectorSDKOnEventCallback event)? onEvent,
    Function(ConnectorSDKOnEventExitCallback event)? onExit,
    Function(ConnectorSDKOnExitSuccessCallback event)? onExitSuccess,
    Function(ConnectorSDKOnExitAbortCallback event)? onExitAbort,
    Function(ConnectorSDKOnExitErrorCallback event)? onExitError,
  });

  /// Reconnect to a connector.
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
