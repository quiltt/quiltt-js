// Since we are not installing this package in package.json for the example app, we mock the types we need
// No need to this in a real app
declare module '@quiltt/react-native' {
  export interface ConnectorSDKCallbackMetadata {
    connectorId: string
    profileId?: string
    connectionId?: string
  }

  export const QuilttConnector: React.FC<any>
  export const QuilttProvider: React.FC<any>
}
