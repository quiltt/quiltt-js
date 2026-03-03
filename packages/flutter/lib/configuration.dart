class QuilttConnectorConfiguration {
  String connectorId;
  String oauthRedirectUrl;
  String? connectionId;
  String? institution;

  QuilttConnectorConfiguration({
    required this.connectorId,
    required this.oauthRedirectUrl,
    this.connectionId,
    this.institution,
  });
}
