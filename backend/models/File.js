class File {
  constructor({
    id,
    user_id,
    type,
    filename,
    path,
    media_type,
    size,
    created_at
  }) {
    this.id = id;
    this.user_id = user_id;
    this.type = type;
    this.filename = filename;
    this.path = path;
    this.media_type = media_type;
    this.size = size;
    this.created_at = created_at;
  }
}

module.exports = File;