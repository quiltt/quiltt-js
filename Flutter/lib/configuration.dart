class QuilttConnectorConfiguration {
  String connectorId;
  String oauthRedirectUrl;
  String? connectionId;

  QuilttConnectorConfiguration({
    required this.connectorId,
    required this.oauthRedirectUrl,
    this.connectionId,
  });
}
