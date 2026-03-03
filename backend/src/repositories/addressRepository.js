const db = require('../config/db');

module.exports = {
  async findByUserId(userId) {
    const { rows } = await db.query('SELECT * FROM addresses WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
    return rows;
  },

  async findById(id) {
    const { rows } = await db.query('SELECT * FROM addresses WHERE id = $1', [id]);
    return rows[0] || null;
  },

  async create({ userId, street, houseNumber, zip, city, country }) {
    const query = `
      INSERT INTO addresses (user_id, street, house_number, zip, city, country)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const { rows } = await db.query(query, [userId, street, houseNumber, zip, city, country]);
    return rows[0];
  },

  async update(id, { street, houseNumber, zip, city, country }) {
    const query = `
      UPDATE addresses
      SET street = $1, house_number = $2, zip = $3, city = $4, country = $5
      WHERE id = $6
      RETURNING *
    `;
    const { rows } = await db.query(query, [street, houseNumber, zip, city, country, id]);
    return rows[0] || null;
  },

  async remove(id) {
    const { rowCount } = await db.query('DELETE FROM addresses WHERE id = $1', [id]);
    return rowCount > 0;
  }
};
