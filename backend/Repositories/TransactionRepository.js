const pool = require('../db/connection');
const Transaction = require('../models/Transaction');

class TransactionRepository {
  static async create({ user_id, date, description, amount, category }) {
    const [result] = await pool.query(
      'INSERT INTO transactions (user_id, date, description, amount, category) VALUES (?, ?, ?, ?, ?)',
      [user_id, date, description, amount, category]
    );
    return new Transaction({ 
      id: result.insertId, 
      user_id, 
      date, 
      description, 
      amount, 
      category 
    });
  }

  static async findByUserId(userId, { startDate, endDate, category } = {}) {
    let query = 'SELECT * FROM transactions WHERE user_id = ?';
    const params = [userId];

    if (startDate) {
      query += ' AND date >= ?';
      params.push(startDate);
    }
    if (endDate) {
      query += ' AND date <= ?';
      params.push(endDate);
    }
    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }

    query += ' ORDER BY date DESC, created_at DESC';

    const [rows] = await pool.query(query, params);
    return rows.map(row => new Transaction(row));
  }

  static async getBalance(userId) {
    const [rows] = await pool.query(
      'SELECT SUM(amount) as balance FROM transactions WHERE user_id = ?',
      [userId]
    );
    return rows[0].balance || 0;
  }

  static async updateUserBankBalance(userId, newBalance) {
    await pool.query(
      'UPDATE users SET bank_balance = ? WHERE id = ?',
      [newBalance, userId]
    );
  }

  static async getUserBankBalance(userId) {
    const [rows] = await pool.query(
      'SELECT bank_balance FROM users WHERE id = ?',
      [userId]
    );
    return rows[0]?.bank_balance || 0;
  }
}

module.exports = TransactionRepository;