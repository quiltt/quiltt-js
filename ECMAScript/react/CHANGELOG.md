# @quiltt/react

## 2.1.1

### Patch Changes

- 43131d5: - Add code examples to README
  - Auto-create Github Releases
  - Misc cleanups
- Updated dependencies [43131d5]
  - @quiltt/core@2.1.1

## 2.1.0

### Minor Changes

- 7debd45: Add support for custom components 'as' props

### Patch Changes

- Updated dependencies [7debd45]
  - @quiltt/core@2.1.0

## 2.0.0

### Major Changes

- bc6fd8c: Create new React Connector SDK helper components supported by refactored hook

### Patch Changes

- Updated dependencies [bc6fd8c]
  - @quiltt/core@2.0.0

## 1.3.0

### Minor Changes

- 6936687: - Fix transpilation issues caused by importing React components
  - Add CI via Github Action
  - Add test Next.js app
  - Misc cleanups

### Patch Changes

- Updated dependencies [6936687]
  - @quiltt/core@1.3.0

## 1.2.8

### Patch Changes

- fa07b6a: Add READMEs
- Updated dependencies [fa07b6a]
  - @quiltt/core@1.2.8

## 1.2.7

### Patch Changes

- 0321f3e: Filter packages to publish
- Updated dependencies [0321f3e]
  - @quiltt/core@1.2.7

## 1.2.6

### Patch Changes

- 1594b4a: Pass NPM_TOKEN for publishing
- Updated dependencies [1594b4a]
  - @quiltt/core@1.2.6

## 1.2.5

### Patch Changes

- ba18907: Publish to npm registry
- Updated dependencies [ba18907]
  - @quiltt/core@1.2.5

## 1.2.4

### Patch Changes

- a05ccfc: Revert types/react and tsup
- Updated dependencies [a05ccfc]
  - @quiltt/core@1.2.4

## 1.2.3

### Patch Changes

- 71ba4d9: Add react and react-dom as devDependency
- Updated dependencies [71ba4d9]
  - @quiltt/core@1.2.3

## 1.2.2

### Patch Changes

- 89fca3b: Add useQuilttConnector hook
- Updated dependencies [89fca3b]
  - @quiltt/core@1.2.2

## 1.2.1

### Patch Changes

- 01e1247: Update packages
- Updated dependencies [01e1247]
  - @quiltt/core@1.2.1

## 1.2.0

### Minor Changes

- 215662a: Update deps

### Patch Changes

- Updated dependencies [215662a]
  - @quiltt/core@1.2.0

## 1.1.5

### Patch Changes

- 4e237ce: Expose useEventListener
- Updated dependencies [4e237ce]
  - @quiltt/core@1.1.5

## 1.1.4

### Patch Changes

- c67e98d: Revert attempt to force reset through renders
- Updated dependencies [c67e98d]
  - @quiltt/core@1.1.4

## 1.1.3

### Patch Changes

- d8fdcaa: Add option to set QuilttProvider to reset on session change
- Updated dependencies [d8fdcaa]
  - @quiltt/core@1.1.3

## 1.1.2

### Patch Changes

- dcf2c5c: Improve session yanking after getting a 401
- Updated dependencies [dcf2c5c]
  - @quiltt/core@1.1.2

## 1.1.1

### Patch Changes

- 0a78cd2: Move session revoking to be directly to storage
- Updated dependencies [0a78cd2]
  - @quiltt/core@1.1.1

## 1.1.0

### Minor Changes

- 7a1e387: Attempt to reduce race conditions with session changes by pulling token changing logic directly into the respective apollo links

### Patch Changes

- Updated dependencies [7a1e387]
  - @quiltt/core@1.1.0

## 1.0.37

### Patch Changes

- 9169fde: Reduce complexity of useSession by replacing useState with useMemo
- Updated dependencies [9169fde]
  - @quiltt/core@1.0.37

## 1.0.36

### Patch Changes

- 9f34730: Remove redundant initializeState logic from useSession
- Updated dependencies [9f34730]
  - @quiltt/core@1.0.36

## 1.0.35

### Patch Changes

- 14309ed: Update deps
- 6b8d7a4: Reduce the risk of race conditions double subscribing to localstorage changes
- Updated dependencies [14309ed]
- Updated dependencies [6b8d7a4]
  - @quiltt/core@1.0.35

## 1.0.34

### Patch Changes

- 54a6574: Save localstorage before memorystorage to give localstorage more time to flush
- Updated dependencies [54a6574]
  - @quiltt/core@1.0.34

## 1.0.33

### Patch Changes

- f0c60dd: Update useSession hook to memoize initialSession
- Updated dependencies [f0c60dd]
  - @quiltt/core@1.0.33

## 1.0.32

### Patch Changes

- 97aa921: Revert adding loading state to graphql as it causes unexpected resets to subcomponents
- Updated dependencies [97aa921]
  - @quiltt/core@1.0.32

## 1.0.31

### Patch Changes

- 18cb0a2: Add loading state to graphql provider to reduce unauthd requests
- Updated dependencies [18cb0a2]
  - @quiltt/core@1.0.31

## 1.0.30

### Patch Changes

- 5d6027b: Fix issue with useSession setSession not being wrapped in useCallback, causing invalidations every render
- Updated dependencies [5d6027b]
  - @quiltt/core@1.0.30

## 1.0.29

### Patch Changes

- 098710f: Fix useEffect and useState looping hell
- Updated dependencies [098710f]
  - @quiltt/core@1.0.29

## 1.0.28

### Patch Changes

- 3877274: Fix issues with graphql client not being updated with new sessions
- Updated dependencies [3877274]
  - @quiltt/core@1.0.28

## 1.0.27

### Patch Changes

- 1b073ea: - Fix potential bugs and memory leaks in `Storage`
  - Add helper hooks to compose other hooks
  - Update useStorage hook
- Updated dependencies [1b073ea]
  - @quiltt/core@1.0.27

## 1.0.26

### Patch Changes

- 4a03bc8: Update types & fix linting
- Updated dependencies [4a03bc8]
  - @quiltt/core@1.0.26

## 1.0.25

### Patch Changes

- 2ffea2f: Fix issue with this being undefined for ActionCableLink
- Updated dependencies [2ffea2f]
  - @quiltt/core@1.0.25

## 1.0.24

### Patch Changes

- d9d234b: Switch to using globalThis for actioncable self
- Updated dependencies [d9d234b]
  - @quiltt/core@1.0.24

## 1.0.23

### Patch Changes

- Updated dependencies [9fb69ae]
  - @quiltt/core@1.0.23

## 1.0.22

### Patch Changes

- 4a06719: Revert back to upstream packages
- Updated dependencies [4a06719]
  - @quiltt/core@1.0.22

## 1.0.21

### Patch Changes

- 49f108a: Fix graphql subscriptions from not working due to channel name mismatch
- Updated dependencies [49f108a]
  - @quiltt/core@1.0.21

## 1.0.20

### Patch Changes

- 7e0d314: Set cable to be a singleton to reduce the chance of having multiple trying to run
- Updated dependencies [7e0d314]
  - @quiltt/core@1.0.20

## 1.0.19

### Patch Changes

- 866407c: Improve websocket subscriptions lifecycle handling
- Updated dependencies [866407c]
  - @quiltt/core@1.0.19

## 1.0.18

### Patch Changes

- bf25cc4: Prevent websockets from attempting to connect without a token
- Updated dependencies [bf25cc4]
  - @quiltt/core@1.0.18

## 1.0.17

### Patch Changes

- 190df4d: Fix issue with ActionCableLink calling the wrong #perform
- Updated dependencies [190df4d]
  - @quiltt/core@1.0.17

## 1.0.16

### Patch Changes

- c284002: Add some types to actioncable and connect logging to config
- Updated dependencies [c284002]
  - @quiltt/core@1.0.16

## 1.0.15

### Patch Changes

- 2f6f903: Fix issue with importing sessions and cache resetting causing request cancelations during race conditions
- Updated dependencies [2f6f903]
  - @quiltt/core@1.0.15

## 1.0.14

### Patch Changes

- a97e9c8: Pin Dependencies & Update Linting
- 6d35bae: Remove unused global declares
- Updated dependencies [a97e9c8]
- Updated dependencies [6d35bae]
  - @quiltt/core@1.0.14

## 1.0.13

### Patch Changes

- 24d28f3: Add missing apollo esms
- Updated dependencies [24d28f3]
  - @quiltt/core@1.0.13

## 1.0.12

### Patch Changes

- 3eb86ce: Force load all of apollo esms
- Updated dependencies [3eb86ce]
  - @quiltt/core@1.0.12

## 1.0.11

### Patch Changes

- 2932555: Load ActionLinkCable Apollo esms
- Updated dependencies [2932555]
  - @quiltt/core@1.0.11

## 1.0.10

### Patch Changes

- f014a84: Set apollo links to load esm from .js
- Updated dependencies [f014a84]
  - @quiltt/core@1.0.10

## 1.0.9

### Patch Changes

- be8e696: Attempt to improve esm loading of apollo links
- Updated dependencies [be8e696]
  - @quiltt/core@1.0.9

## 1.0.8

### Patch Changes

- 250f817: Refactor AuthLink to improve compiling
- Updated dependencies [250f817]
  - @quiltt/core@1.0.8

## 1.0.7

### Patch Changes

- 9e78757: Fix issues with QuilttClient/Link not working
- Updated dependencies [9e78757]
  - @quiltt/core@1.0.7

## 1.0.6

### Patch Changes

- 882b229: Set default forwardlink within quiltt link
- Updated dependencies [882b229]
  - @quiltt/core@1.0.6

## 1.0.5

### Patch Changes

- 795bf20: Improve how graphql client is loaded
- Updated dependencies [795bf20]
  - @quiltt/core@1.0.5

## 1.0.4

### Patch Changes

- 9bc26d1: Import action cable code to help with building
- Updated dependencies [9bc26d1]
  - @quiltt/core@1.0.4

## 1.0.3

### Patch Changes

- 19a5f41: Allow client id to be optional for token based apps
- Updated dependencies [19a5f41]
  - @quiltt/core@1.0.3

## 1.0.2

### Patch Changes

- 3f06262: Update build config
- Updated dependencies [3f06262]
  - @quiltt/core@1.0.2

## 1.0.1

### Patch Changes

- 86d6689: Fix issue with react not reexporting core
- Updated dependencies [86d6689]
  - @quiltt/core@1.0.1
