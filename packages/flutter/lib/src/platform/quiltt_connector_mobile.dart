import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';
import 'oauth_utils.dart';
import 'package:quiltt_connector/configuration.dart';
import 'package:quiltt_connector/event.dart';
import 'package:quiltt_connector/quiltt_sdk_version.dart';
import 'package:quiltt_connector/telemetry_utils.dart';
import 'package:quiltt_connector/url_utils.dart';

import 'quiltt_platform_interface.dart';

/// Creates the mobile platform connector implementation.
QuilttPlatformInterface createPlatformConnector() => QuilttConnectorMobile();

/// Mobile implementation of [QuilttPlatformInterface] using WebView.
class QuilttConnectorMobile extends QuilttPlatformInterface {
  final _WebViewPage _webViewPage = _WebViewPage();
  final WebViewController controller = WebViewController();

  @override
  void authenticate(String token) {
    sessionToken = token;
    final optionsJson = jsonEncode({
      'source': 'quiltt',
      'type': 'Options',
      'token': token,
    });
    controller.runJavaScript('window.postMessage($optionsJson);');
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
    _webViewPage._init(
      controller,
      context,
      config,
      token: sessionToken,
      onEvent: onEvent,
      onExit: onExit,
      onExitSuccess: onExitSuccess,
      onExitAbort: onExitAbort,
      onExitError: onExitError,
    );

    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (BuildContext context) {
          return _webViewPage.build(context, token: sessionToken);
        },
      ),
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
    if (config.connectionId == null || config.connectionId!.isEmpty) {
      debugPrint(
        'Quiltt: reconnect() requires a non-null, non-empty connectionId',
      );
      final metadata = ConnectorSDKCallbackMetadata(
        connectorId: config.connectorId,
      );
      onExitError?.call(
        ConnectorSDKOnExitErrorCallback(eventMetadata: metadata),
      );
      return;
    }

    _webViewPage._init(
      controller,
      context,
      config,
      token: sessionToken,
      onEvent: onEvent,
      onExit: onExit,
      onExitSuccess: onExitSuccess,
      onExitAbort: onExitAbort,
      onExitError: onExitError,
    );

    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (BuildContext context) {
          return _webViewPage.build(
            context,
            token: sessionToken,
            connectionId: config.connectionId,
          );
        },
      ),
    );
  }
}

class _WebViewPage {
  late WebViewController controller;
  late BuildContext context;
  late QuilttConnectorConfiguration config;
  String? token;
  bool _isInitialized = false;

  Function(ConnectorSDKOnEventCallback event)? onEvent;
  Function(ConnectorSDKOnEventExitCallback event)? onExit;
  Function(ConnectorSDKOnExitSuccessCallback event)? onExitSuccess;
  Function(ConnectorSDKOnExitAbortCallback event)? onExitAbort;
  Function(ConnectorSDKOnExitErrorCallback event)? onExitError;

  void _init(
    WebViewController controller,
    BuildContext context,
    QuilttConnectorConfiguration config, {
    String? token,
    Function(ConnectorSDKOnEventCallback event)? onEvent,
    Function(ConnectorSDKOnEventExitCallback event)? onExit,
    Function(ConnectorSDKOnExitSuccessCallback event)? onExitSuccess,
    Function(ConnectorSDKOnExitAbortCallback event)? onExitAbort,
    Function(ConnectorSDKOnExitErrorCallback event)? onExitError,
  }) {
    this.controller = controller;
    this.context = context;
    this.token = token;
    this.config = config;
    this.onEvent = onEvent;
    this.onExit = onExit;
    this.onExitSuccess = onExitSuccess;
    this.onExitAbort = onExitAbort;
    this.onExitError = onExitError;
  }

  void _closeWebView() {
    if (Navigator.canPop(context)) {
      controller.clearLocalStorage();
      Navigator.pop(context);
      _isInitialized = false; // Reset initialization state
    }
  }

  bool _shouldRender(String url) {
    // Don't render Quiltt connector events in WebView
    if (url.startsWith('quilttconnector://')) {
      return false;
    }
    // Render everything else (like iOS does)
    return true;
  }

  Future<void> _handleOAuth(String oauthUrl) async {
    await handleOAuthUrl(
      oauthUrl,
      config.connectorId,
      onEvent: onEvent,
      onExit: onExit,
      onExitError: onExitError,
    );
  }

  Future<void> _handleQuilttConnectorEvent(
    Uri uri,
    String initInjectedJavaScript,
  ) async {
    ConnectorSDKCallbackMetadata eventMetadata = ConnectorSDKCallbackMetadata(
      connectorId: config.connectorId,
      connectionId: uri.queryParameters['connectionId'],
      profileId: uri.queryParameters['profileId'],
    );

    // Android's URI parser lowercases the host; normalise for safety.
    final host = uri.host.toLowerCase();
    final eventType = ConnectorSDKEventType.fromUrlHost(host);

    try {
      switch (host) {
        case 'load':
          try {
            await controller.runJavaScript(initInjectedJavaScript);
          } catch (error) {
            debugPrint('Failed to inject initialization JavaScript: $error');
          }
          break;
        case 'navigate':
          if (uri.queryParameters.containsKey('url')) {
            var navigateUrl = Uri.decodeFull(uri.queryParameters['url']!);

            // Check if the URL is already encoded
            if (URLUtils.isEncoded(navigateUrl)) {
              try {
                // If encoded, decode once to prevent double-encoding
                final decodedUrl = Uri.decodeComponent(navigateUrl);
                await _handleOAuth(decodedUrl);
              } catch (error) {
                debugPrint('Navigate URL decoding failed, using original');
                await _handleOAuth(navigateUrl);
              }
            } else {
              await _handleOAuth(navigateUrl);
            }
          } else {
            debugPrint('Navigate URL missing from request');
          }
          break;
        case 'exitsuccess':
          try {
            onEvent?.call(
              ConnectorSDKOnEventCallback(
                type: ConnectorSDKEventType.exitSuccessful,
                eventMetadata: eventMetadata,
              ),
            );
            onExit?.call(
              ConnectorSDKOnEventExitCallback(
                type: ConnectorSDKEventType.exitSuccessful,
                eventMetadata: eventMetadata,
              ),
            );
            onExitSuccess?.call(
              ConnectorSDKOnExitSuccessCallback(eventMetadata: eventMetadata),
            );
          } catch (error) {
            debugPrint('Error in exit success callbacks: $error');
          } finally {
            _closeWebView();
          }
          break;
        case 'exitabort':
          try {
            onEvent?.call(
              ConnectorSDKOnEventCallback(
                type: ConnectorSDKEventType.exitAborted,
                eventMetadata: eventMetadata,
              ),
            );
            onExit?.call(
              ConnectorSDKOnEventExitCallback(
                type: ConnectorSDKEventType.exitAborted,
                eventMetadata: eventMetadata,
              ),
            );
            onExitAbort?.call(
              ConnectorSDKOnExitAbortCallback(eventMetadata: eventMetadata),
            );
          } catch (error) {
            debugPrint('Error in exit abort callbacks: $error');
          } finally {
            _closeWebView();
          }
          break;
        case 'exiterror':
          try {
            onEvent?.call(
              ConnectorSDKOnEventCallback(
                type: ConnectorSDKEventType.exitErrored,
                eventMetadata: eventMetadata,
              ),
            );
            onExit?.call(
              ConnectorSDKOnEventExitCallback(
                type: ConnectorSDKEventType.exitErrored,
                eventMetadata: eventMetadata,
              ),
            );
            onExitError?.call(
              ConnectorSDKOnExitErrorCallback(eventMetadata: eventMetadata),
            );
          } catch (error) {
            debugPrint('Error in exit error callbacks: $error');
          } finally {
            _closeWebView();
          }
          break;
        case 'authenticate':
          // Internal mobile signal (web uses this to hide its loading overlay).
          // Not forwarded to callbacks — no canonical SDK event type.
          break;
        default:
          debugPrint('Unknown Quiltt event: $host');
      }
    } catch (error) {
      debugPrint('Error handling Quiltt connector event: $error');
      // Only close WebView on exit events to prevent users from getting stuck.
      if (eventType != null &&
          eventType != ConnectorSDKEventType.loaded &&
          eventType != ConnectorSDKEventType.opened) {
        _closeWebView();
      }
    }
  }

  void _initializeController(
    String connectorUrl,
    String initInjectedJavaScript,
  ) {
    controller
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setNavigationDelegate(
        NavigationDelegate(
          onProgress: (int progress) {},
          onPageStarted: (String url) {},
          onPageFinished: (String url) {},
          onWebResourceError: (WebResourceError error) {},
          onNavigationRequest: (NavigationRequest request) async {
            Uri uri = Uri.parse(request.url);

            if (uri.scheme == 'quilttconnector') {
              await _handleQuilttConnectorEvent(uri, initInjectedJavaScript);
              return NavigationDecision.prevent;
            }

            if (_shouldRender(request.url)) {
              return NavigationDecision.navigate;
            }

            await _handleOAuth(request.url);
            return NavigationDecision.prevent;
          },
        ),
      )
      ..loadRequest(
        Uri.parse(connectorUrl),
        headers: {
          'Quiltt-SDK-Agent': getSDKAgent(
            quilttSdkVersion,
            getRuntimePlatformInfo(),
          ),
        },
      );
  }

  Widget build(BuildContext context, {String? token, String? connectionId}) {
    // Apply smart URL encoding to the app launcher URL
    var safeAppLauncherUrl = URLUtils.smartEncodeURIComponent(
      config.appLauncherUrl,
    );

    // Build the URL with proper parameter handling
    var uriBuilder = Uri.https('${config.connectorId}.quiltt.app', '/', {
      'mode': 'webview',
      'agent': 'flutter-$quilttSdkVersion',
    });

    // Handle the app launcher URL with special care
    var queryParams = Map<String, String>.from(uriBuilder.queryParameters);

    // If already encoded, decode once to prevent double encoding that would happen
    // when adding it to the URL parameters
    if (URLUtils.isEncoded(safeAppLauncherUrl)) {
      final decodedOnce = Uri.decodeComponent(safeAppLauncherUrl);
      queryParams['app_launcher_url'] = decodedOnce;
    } else {
      queryParams['app_launcher_url'] = safeAppLauncherUrl;
    }

    if (config.themeMode case final String themeMode) {
      queryParams['theme_mode'] = themeMode;
    }

    var connectorUrl = Uri.https(
      uriBuilder.authority,
      uriBuilder.path,
      queryParams,
    ).toString();

    debugPrint(connectorUrl);

    final optionsJson = jsonEncode({
      'source': 'quiltt',
      'type': 'Options',
      'token': ?token,
      'connectorId': config.connectorId,
      'connectionId': ?connectionId,
      'institution': ?config.institution,
    });

    final initInjectedJavaScript = 'window.postMessage($optionsJson);';

    // Only initialize the controller once
    if (!_isInitialized) {
      _initializeController(connectorUrl, initInjectedJavaScript);
      _isInitialized = true;
    }

    return Scaffold(
      body: SafeArea(child: WebViewWidget(controller: controller)),
    );
  }
}
