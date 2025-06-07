// backend/models/User.js
const db = require('../config/db');

const User = {
  async create({ username, passwordHash, role }) {
    const query = `INSERT INTO users (username, password, role) VALUES ($1, $2, $3)`;
    await db.query(query, [username, passwordHash, role]);
  },

  async findByUsername(username) {
    const result = await db.query(`SELECT * FROM users WHERE username = $1`, [username]);
    return result.rows[0];
  }
};

module.exports = User;
