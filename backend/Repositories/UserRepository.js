const pool = require('../db/connection');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

class UserRepository {
  static async create({ name, email, password }) {
    const hash = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
      [name, email, hash]
    );
    return new User({ id: result.insertId, name, email, password_hash: hash });
  }

  static async findByEmail(email) {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows.length ? new User(rows[0]) : null;
  }

  static async findById(id) {
    const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
    return rows.length ? new User(rows[0]) : null;
  }

  static async validatePassword(password, hash) {
    return bcrypt.compare(password, hash);
  }

  static async updateProfile(id, { name, email, profile_url }) {
    const updates = [];
    const values = [];
    
    if (name !== undefined) {
      updates.push('name = ?');
      values.push(name);
    }
    if (email !== undefined) {
      updates.push('email = ?');
      values.push(email);
    }
    if (profile_url !== undefined) {
      updates.push('profile_url = ?');
      values.push(profile_url);
    }
    
    if (updates.length === 0) return null;
    
    values.push(id);
    await pool.query(
      `UPDATE users SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      values
    );
    
    return this.findById(id);
  }
}

module.exports = UserRepository;

