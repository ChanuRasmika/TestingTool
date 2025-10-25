const pool = require('../db/connection');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

async function seed() {
  if (process.env.NODE_ENV === 'production') {
    console.error('Refusing to run seed in production.');
    process.exit(1);
  }

  const conn = await pool.getConnection();
  try {
    console.log('Seeding database:', process.env.DB_NAME);

    // Truncate tables in safe mode
    await conn.query('SET FOREIGN_KEY_CHECKS = 0');
    await conn.query('TRUNCATE TABLE audit_logs');
    await conn.query('TRUNCATE TABLE files');
    await conn.query('TRUNCATE TABLE transactions');
    await conn.query('TRUNCATE TABLE users');
    await conn.query('SET FOREIGN_KEY_CHECKS = 1');

    const password1 = await bcrypt.hash('password123', 10);
    const password2 = await bcrypt.hash('secret', 10);

    const [res1] = await conn.query(
      'INSERT INTO users (name, email, password_hash, profile_url, bank_balance) VALUES (?, ?, ?, ?, ?)',
      ['Alice Demo', 'alice@example.com', password1, '/uploads/alice.jpg', 1500000.00]
    );

    const [res2] = await conn.query(
      'INSERT INTO users (name, email, password_hash, profile_url, bank_balance) VALUES (?, ?, ?, ?, ?)',
      ['Bob Test', 'bob@example.com', password2, '/uploads/bob.png', 750000.00]
    );

    const aliceId = res1.insertId;
    const bobId = res2.insertId;

    const transactions = [
      [aliceId, '2025-10-01', 'Coffee', -3.5, 'Food'],
      [aliceId, '2025-10-02', 'Payroll', 1500.0, 'Income'],
      [aliceId, '2025-10-03', 'Groceries', -45.95, 'Groceries'],
      [bobId, '2025-10-05', 'Subscription', -9.99, 'Services']
    ];

    for (const tx of transactions) {
      await conn.query(
        'INSERT INTO transactions (user_id, date, description, amount, category) VALUES (?, ?, ?, ?, ?)',
        tx
      );
    }

    await conn.query(
      "INSERT INTO audit_logs (user_id, event, event_data, ip) VALUES (?, ?, ?, ?)",
      [aliceId, 'signup', JSON.stringify({ method: 'seed' }), '127.0.0.1']
    );

    console.log('Seeding complete.');
  } catch (err) {
    console.error('Seeding failed:', err);
  } finally {
    conn.release();
    process.exit(0);
  }
}

seed();
