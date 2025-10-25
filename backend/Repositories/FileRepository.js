const pool = require('../db/connection');
const File = require('../models/File');

class FileRepository {
  static async create({ user_id, type, filename, path, media_type, size }) {
    const [result] = await pool.query(
      'INSERT INTO files (user_id, type, filename, path, media_type, size) VALUES (?, ?, ?, ?, ?, ?)',
      [user_id, type, filename, path, media_type, size]
    );
    return new File({ 
      id: result.insertId, 
      user_id, 
      type, 
      filename, 
      path, 
      media_type, 
      size 
    });
  }

  static async findByUserAndType(userId, type) {
    const [rows] = await pool.query(
      'SELECT * FROM files WHERE user_id = ? AND type = ? ORDER BY created_at DESC LIMIT 1',
      [userId, type]
    );
    return rows.length ? new File(rows[0]) : null;
  }

  static async deleteById(id) {
    await pool.query('DELETE FROM files WHERE id = ?', [id]);
  }
}

module.exports = FileRepository;