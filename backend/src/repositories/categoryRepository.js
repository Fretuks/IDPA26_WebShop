const db = require('../config/db');

module.exports = {
  async findAll() {
    const { rows } = await db.query('SELECT * FROM categories ORDER BY name ASC');
    return rows;
  },

  async findById(id) {
    const { rows } = await db.query('SELECT * FROM categories WHERE id = $1', [id]);
    return rows[0] || null;
  },

  async create({ name, description }) {
    const { rows } = await db.query(
      'INSERT INTO categories (name, description) VALUES ($1, $2) RETURNING *',
      [name, description]
    );
    return rows[0];
  },

  async update(id, { name, description }) {
    const { rows } = await db.query(
      'UPDATE categories SET name = $1, description = $2 WHERE id = $3 RETURNING *',
      [name, description, id]
    );
    return rows[0] || null;
  },

  async remove(id) {
    const { rowCount } = await db.query('DELETE FROM categories WHERE id = $1', [id]);
    return rowCount > 0;
  }
};
