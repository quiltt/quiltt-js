# nextjs

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
