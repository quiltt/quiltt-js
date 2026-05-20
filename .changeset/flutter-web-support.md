---
"@quiltt/flutter": major
---

Add Flutter Web platform support via dart:js_interop

- Platform abstraction layer with conditional import (mobile WebView / web JS interop)
- Lazy-loads Quiltt JS SDK from CDN; detects pre-loaded SDK and skips injection
- **Breaking**: introduces `ConnectorSDKEventType` enum — `onEvent` and `onExit` callbacks now carry a typed `ConnectorSDKEventType` instead of a raw string
- **Breaking**: removes previously public `connectorId`, `connectionId`, `controller` fields
