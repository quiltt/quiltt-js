// telemetry_native.dart uses dart:io which doesn't exist on web. The conditional
// export swaps in the web stub so that this public library file compiles on all
// supported platforms, even though getRuntimePlatformInfo() is only *called* by
// the mobile path (quiltt_connector_mobile.dart).
export 'src/platform/telemetry_native.dart'
    if (dart.library.js_interop) 'src/platform/telemetry_web.dart';

/// Returns the SDK User-Agent string in the format `Quiltt/<version> (<platform>)`.
String getSDKAgent(String sdkVersion, String platformInfo) {
  return 'Quiltt/$sdkVersion ($platformInfo)';
}
