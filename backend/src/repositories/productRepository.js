const db = require('../config/db');

module.exports = {
  async findAllActive() {
    const query = `
      SELECT p.*, c.name AS category_name
      FROM products p
      JOIN categories c ON c.id = p.category_id
      WHERE p.active = TRUE
      ORDER BY p.created_at DESC
    `;
    const { rows } = await db.query(query);
    return rows;
  },

  async findById(id) {
    const query = `
      SELECT p.*, c.name AS category_name
      FROM products p
      JOIN categories c ON c.id = p.category_id
      WHERE p.id = $1
    `;
    const { rows } = await db.query(query, [id]);
    return rows[0] || null;
  },

  async create({ name, description, price, stock, categoryId, active = true }) {
    const query = `
      INSERT INTO products (name, description, price, stock, category_id, active)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const values = [name, description, price, stock, categoryId, active];
    const { rows } = await db.query(query, values);
    return rows[0];
  },

  async update(id, { name, description, price, stock, categoryId, active }) {
    const query = `
      UPDATE products
      SET name = $1, description = $2, price = $3, stock = $4, category_id = $5, active = $6
      WHERE id = $7
      RETURNING *
    `;
    const values = [name, description, price, stock, categoryId, active, id];
    const { rows } = await db.query(query, values);
    return rows[0] || null;
  },

  async remove(id) {
    const { rowCount } = await db.query('DELETE FROM products WHERE id = $1', [id]);
    return rowCount > 0;
  },

  async updateStock(client, id, stock) {
    const executor = client || db;
    const { rows } = await executor.query('UPDATE products SET stock = $1 WHERE id = $2 RETURNING *', [stock, id]);
    return rows[0] || null;
  }
};
