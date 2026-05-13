// Web stub for getRuntimePlatformInfo(). The mobile implementation uses dart:io
// to read OS version and Dart version, neither of which is available on web.
// This stub satisfies the conditional export in telemetry_utils.dart so the
// public API compiles on web. The value is not currently used by the web
// connector (the JS SDK manages its own telemetry), but is correct if a shared
// codepath ever calls getSDKAgent() on web.
/// Returns platform info for web targets.
String getRuntimePlatformInfo() {
  return 'Flutter Web';
}
