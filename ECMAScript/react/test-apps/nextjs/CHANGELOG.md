# nextjs

## 3.0.0

### Major Changes

- [#180](https://github.com/quiltt/quiltt-public/pull/180) [`1ea994b`](https://github.com/quiltt/quiltt-public/commit/1ea994b7484edad336183cec6af0657ad301e336) Thanks [@dependabot](https://github.com/apps/dependabot)! - Bump follow-redirects

## 2.2.7

### Patch Changes

- 13bdf9f: Fix URL and atob polyfill
- Updated dependencies [13bdf9f]
  - @quiltt/react@3.3.7

## 2.2.6

### Patch Changes

- bb47eb5: Retry GraphQL requests on Network Errors
- Updated dependencies [bb47eb5]
  - @quiltt/react@3.3.6

## 2.2.5

### Patch Changes

- f633be3: [Internal] Rename Deployments to Clients in Auth
- Updated dependencies [f633be3]
  - @quiltt/react@3.3.5

## 2.2.4

### Patch Changes

- b659537: Fix MX OAuth and move some lib into peer dependencies
- Updated dependencies [b659537]
  - @quiltt/react@3.3.4

## 2.2.3

### Patch Changes

- 48a50d0: Fix handle plaid oauth link bug
- Updated dependencies [48a50d0]
  - @quiltt/react@3.3.3

## 2.2.2

### Patch Changes

- 4a9118b: React Native sdk to support Plaid Oauth url
- Updated dependencies [4a9118b]
  - @quiltt/react@3.3.2

## 2.2.1

### Patch Changes

- 9bfbc03: Match eventType with MessageType in react native sdk
- Updated dependencies [9bfbc03]
  - @quiltt/react@3.3.1

## 2.2.0

### Minor Changes

- 2a6410f: Add profileId to ConnectorSDKCallbackMetadata

### Patch Changes

- Updated dependencies [2a6410f]
  - @quiltt/react@3.3.0

## 2.1.2

### Patch Changes

- 9f3783a: Fix React Native package entry point
- Updated dependencies [9f3783a]
  - @quiltt/react@3.2.2

## 2.1.1

### Patch Changes

- 31b7543: Drop react-native-url-polyfill
- Updated dependencies [31b7543]
  - @quiltt/react@3.2.1

## 2.1.0

### Minor Changes

- 07bc9f3: Release React Native SDK

### Patch Changes

- Updated dependencies [07bc9f3]
  - @quiltt/react@3.2.0

## 2.0.7

### Patch Changes

- ab55ccb: Skip browser code when in expo app
- Updated dependencies [ab55ccb]
  - @quiltt/react@3.1.3

## 2.0.6

### Patch Changes

- 5ca68bf: Update ConnectorSDKOnLoadCallback type
- Updated dependencies [5ca68bf]
  - @quiltt/react@3.1.2

## 2.0.5

### Patch Changes

- a66f1bd: Add onLoad callbacks
- Updated dependencies [a66f1bd]
  - @quiltt/react@3.1.1

## 2.0.4

### Patch Changes

- Updated dependencies [af052a7]
  - @quiltt/react@3.1.0

## 2.0.3

### Patch Changes

- Updated dependencies [977a6a5]
  - @quiltt/react@3.0.3

## 2.0.2

### Patch Changes

- 315de22: Increase 429 handling for ci/cd
- Updated dependencies [315de22]
  - @quiltt/react@3.0.2

## 2.0.1

### Patch Changes

- c8bfa0a: Export additional ConnectorSDK types
- Updated dependencies [c8bfa0a]
  - @quiltt/react@3.0.1

## 2.0.0

### Major Changes

- e12a1ef: Rename Connector SDK Types for better namespacing

### Patch Changes

- Updated dependencies [e12a1ef]
  - @quiltt/react@3.0.0

## 1.4.1

### Patch Changes

- 44e9759: Fix bug with backoff timer, extend max delay before failure
- Updated dependencies [44e9759]
  - @quiltt/react@2.4.1

## 1.4.0

### Minor Changes

- 48ae700: Add Reset to the SDK API

### Patch Changes

- Updated dependencies [48ae700]
  - @quiltt/react@2.4.0

## 1.3.2

### Patch Changes

- c4ac918: Add retries to auth api when dealing with network related errors
- Updated dependencies [c4ac918]
  - @quiltt/react@2.3.2

## 1.3.1

### Patch Changes

- 108899b: Add ability for session import to validate environment
- Updated dependencies [108899b]
  - @quiltt/react@2.3.1

## 1.3.0

### Minor Changes

- 264fb68: Add EID to Session JWT Type

### Patch Changes

- Updated dependencies [264fb68]
  - @quiltt/react@2.3.0

## 1.2.1

### Patch Changes

- b4dd03c: Add ApolloError to graphql exports
- Updated dependencies [b4dd03c]
  - @quiltt/react@2.2.1

## 1.2.0

### Minor Changes

- 24f6df1: This introduces a new Javascript API that can be used instead of or with the DOM API, giving exposure to exit events. There are a few ways to use it:

  ## 1. HTML5

  If you're using the HTML interface, and need to upgrade to using some Javascript code, you can; but all event registrations are on a global level. This means that if you have multiple buttons, you will look at the metadata of the response to see which one you're reacting to.

  ```html
  <head>
    <script src="https://cdn.quiltt.io/v1/connector.js"></script>
    <script language="JavaScript">
      Quiltt.onExitSuccess((metadata) =>
        console.log("Global onExitSuccess", metadata.connectionId)
      );
    </script>
  </head>
  <body>
    <button quiltt-button="<CONNECTOR_ID">Click Here!</button>
  </body>
  ```

  ## 2. Javascript

  Now if you want to do something more complex, and expect to be working with multiple buttons in different ways, then the Javascript SDK may be the way to go. With this, you can control everything in JS.

  ```html
  <head>
    <script src="https://cdn.quiltt.io/v1/connector.js"></script>
    <script language="JavaScript">
      Quiltt.authenticate("<SESSION_TOKEN>");

      const connector = Quiltt.connect("<CONNECTOR_ID>", {
        onExitSuccess: (metadata) => {
          console.log("Connector onExitSuccess", metadata.connectionId),
        });

      connector.open();
    </script>
  </head>
  ```

  ## 3. React

  With these new hooks, the React components now support callbacks.

  ```tsx
  import { QuilttButton } from '@quiltt/react'

  export const App = () => {
    const [connectionId, setConnectionId] = useState<string>()
    const handleSuccess = (metadata) => setConnectionId(metadata?.connectionId)

    return (
      <QuilttButton connectorId="<CONNECTOR_ID>" onExitSuccess={handleSuccess}>
        Add
      </QuilttButton>

      <QuilttButton connectorId="<CONNECTOR_ID>" connectionId={connectionId}>
        Repair
      </QuilttButton>
    )
  }
  ```

### Patch Changes

- Updated dependencies [24f6df1]
  - @quiltt/react@2.2.0

## 1.1.2

### Patch Changes

- Updated dependencies [541c809]
  - @quiltt/react@2.1.2

## 1.1.1

### Patch Changes

- Updated dependencies [43131d5]
  - @quiltt/react@2.1.1

## 1.1.0

### Minor Changes

- 7debd45: Add support for custom components 'as' props

### Patch Changes

- Updated dependencies [7debd45]
  - @quiltt/react@2.1.0

## 1.0.2

### Patch Changes

- Updated dependencies [bc6fd8c]
  - @quiltt/react@2.0.0

## 1.0.1

### Patch Changes

- Updated dependencies [6936687]
  - @quiltt/react@1.3.0
