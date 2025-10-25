class AuditLog {
  constructor({
    id,
    user_id,
    event,
    event_data,
    ip,
    created_at
  }) {
    this.id = id;
    this.user_id = user_id;
    this.event = event;
    this.event_data = event_data;
    this.ip = ip;
    this.created_at = created_at;
  }
}

module.exports = AuditLog;
