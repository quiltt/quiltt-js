# @quiltt/core

## 3.2.2

### Patch Changes

- 9f3783a: Fix React Native package entry point

## 3.2.1

### Patch Changes

- 31b7543: Drop react-native-url-polyfill

## 3.2.0

### Minor Changes

- 07bc9f3: Release React Native SDK

## 3.1.3

### Patch Changes

- ab55ccb: Skip browser code when in expo app

## 3.1.2

### Patch Changes

- 5ca68bf: Update ConnectorSDKOnLoadCallback type

## 3.1.1

### Patch Changes

- a66f1bd: Add onLoad callbacks

## 3.1.0

### Minor Changes

- af052a7: Add 'Load' to ConnectorSDKEventType

## 3.0.3

### Patch Changes

- 977a6a5: Bump graphql from 16.7.1 to 16.8.1

## 3.0.2

### Patch Changes

- 315de22: Increase 429 handling for ci/cd

## 3.0.1

### Patch Changes

- c8bfa0a: Export additional ConnectorSDK types

## 3.0.0

### Major Changes

- e12a1ef: Rename Connector SDK Types for better namespacing

## 2.4.1

### Patch Changes

- 44e9759: Fix bug with backoff timer, extend max delay before failure

## 2.4.0

### Minor Changes

- 48ae700: Add Reset to the SDK API

## 2.3.2

### Patch Changes

- c4ac918: Add retries to auth api when dealing with network related errors

## 2.3.1

### Patch Changes

- 108899b: Add ability for session import to validate environment

## 2.3.0

### Minor Changes

- 264fb68: Add EID to Session JWT Type

## 2.2.1

### Patch Changes

- b4dd03c: Add ApolloError to graphql exports

## 2.2.0

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

## 2.1.2

### Patch Changes

- 541c809: `@quiltt/react`: Add support for using a custom storage key in the `useSession` hook

## 2.1.1

### Patch Changes

- 43131d5: - Add code examples to README
  - Auto-create Github Releases
  - Misc cleanups

## 2.1.0

### Minor Changes

- 7debd45: Add support for custom components 'as' props

## 2.0.0

### Major Changes

- bc6fd8c: Create new React Connector SDK helper components supported by refactored hook

## 1.3.0

### Minor Changes

- 6936687: - Fix transpilation issues caused by importing React components
  - Add CI via Github Action
  - Add test Next.js app
  - Misc cleanups

## 1.2.8

### Patch Changes

- fa07b6a: Add READMEs

## 1.2.7

### Patch Changes

- 0321f3e: Filter packages to publish

## 1.2.6

### Patch Changes

- 1594b4a: Pass NPM_TOKEN for publishing

## 1.2.5

### Patch Changes

- ba18907: Publish to npm registry

## 1.2.4

### Patch Changes

- a05ccfc: Revert types/react and tsup

## 1.2.3

### Patch Changes

- 71ba4d9: Add react and react-dom as devDependency

## 1.2.2

### Patch Changes

- 89fca3b: Add useQuilttConnector hook

## 1.2.1

### Patch Changes

- 01e1247: Update packages

## 1.2.0

### Minor Changes

- 215662a: Update deps

## 1.1.5

### Patch Changes

- 4e237ce: Expose useEventListener

## 1.1.4

### Patch Changes

- c67e98d: Revert attempt to force reset through renders

## 1.1.3

### Patch Changes

- d8fdcaa: Add option to set QuilttProvider to reset on session change

## 1.1.2

### Patch Changes

- dcf2c5c: Improve session yanking after getting a 401

## 1.1.1

### Patch Changes

- 0a78cd2: Move session revoking to be directly to storage

## 1.1.0

### Minor Changes

- 7a1e387: Attempt to reduce race conditions with session changes by pulling token changing logic directly into the respective apollo links

## 1.0.37

### Patch Changes

- 9169fde: Reduce complexity of useSession by replacing useState with useMemo

## 1.0.36

### Patch Changes

- 9f34730: Remove redundant initializeState logic from useSession

## 1.0.35

### Patch Changes

- 14309ed: Update deps
- 6b8d7a4: Reduce the risk of race conditions double subscribing to localstorage changes

## 1.0.34

### Patch Changes

- 54a6574: Save localstorage before memorystorage to give localstorage more time to flush

## 1.0.33

### Patch Changes

- f0c60dd: Update useSession hook to memoize initialSession

## 1.0.32

### Patch Changes

- 97aa921: Revert adding loading state to graphql as it causes unexpected resets to subcomponents

## 1.0.31

### Patch Changes

- 18cb0a2: Add loading state to graphql provider to reduce unauthd requests

## 1.0.30

### Patch Changes

- 5d6027b: Fix issue with useSession setSession not being wrapped in useCallback, causing invalidations every render

## 1.0.29

### Patch Changes

- 098710f: Fix useEffect and useState looping hell

## 1.0.28

### Patch Changes

- 3877274: Fix issues with graphql client not being updated with new sessions

## 1.0.27

### Patch Changes

- 1b073ea: - Fix potential bugs and memory leaks in `Storage`
  - Add helper hooks to compose other hooks
  - Update useStorage hook

## 1.0.26

### Patch Changes

- 4a03bc8: Update types & fix linting

## 1.0.25

### Patch Changes

- 2ffea2f: Fix issue with this being undefined for ActionCableLink

## 1.0.24

### Patch Changes

- d9d234b: Switch to using globalThis for actioncable self

## 1.0.23

### Patch Changes

- 9fb69ae: Fix issues with SSR on nextjs and subscriptions

## 1.0.22

### Patch Changes

- 4a06719: Revert back to upstream packages

## 1.0.21

### Patch Changes

- 49f108a: Fix graphql subscriptions from not working due to channel name mismatch

## 1.0.20

### Patch Changes

- 7e0d314: Set cable to be a singleton to reduce the chance of having multiple trying to run

## 1.0.19

### Patch Changes

- 866407c: Improve websocket subscriptions lifecycle handling

## 1.0.18

### Patch Changes

- bf25cc4: Prevent websockets from attempting to connect without a token

## 1.0.17

### Patch Changes

- 190df4d: Fix issue with ActionCableLink calling the wrong #perform

## 1.0.16

### Patch Changes

- c284002: Add some types to actioncable and connect logging to config

## 1.0.15

### Patch Changes

- 2f6f903: Fix issue with importing sessions and cache resetting causing request cancelations during race conditions

## 1.0.14

### Patch Changes

- a97e9c8: Pin Dependencies & Update Linting
- 6d35bae: Remove unused global declares

## 1.0.13

### Patch Changes

- 24d28f3: Add missing apollo esms

## 1.0.12

### Patch Changes

- 3eb86ce: Force load all of apollo esms

## 1.0.11

### Patch Changes

- 2932555: Load ActionLinkCable Apollo esms

## 1.0.10

### Patch Changes

- f014a84: Set apollo links to load esm from .js

## 1.0.9

### Patch Changes

- be8e696: Attempt to improve esm loading of apollo links

## 1.0.8

### Patch Changes

- 250f817: Refactor AuthLink to improve compiling

## 1.0.7

### Patch Changes

- 9e78757: Fix issues with QuilttClient/Link not working

## 1.0.6

### Patch Changes

- 882b229: Set default forwardlink within quiltt link

## 1.0.5

### Patch Changes

- 795bf20: Improve how graphql client is loaded

## 1.0.4

### Patch Changes

- 9bc26d1: Import action cable code to help with building

## 1.0.3

### Patch Changes

- 19a5f41: Allow client id to be optional for token based apps

## 1.0.2

### Patch Changes

- 3f06262: Update build config

## 1.0.1

### Patch Changes

- 86d6689: Fix issue with react not reexporting core
