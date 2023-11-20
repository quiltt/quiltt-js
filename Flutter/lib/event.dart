class EventMetadata {
  String connectorId;
  String? connectionId;
  String? moveId;

  EventMetadata({
    required this.connectorId,
    this.connectionId,
    this.moveId,
  });
}

class Event {
  String type;
  EventMetadata eventMetadata;

  Event({
    required this.type,
    required this.eventMetadata,
  });
}
