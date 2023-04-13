# @quiltt/core

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
