const db = require('../config/db');

module.exports = {
  async getOrCreateByUserId(userId) {
    const existing = await db.query('SELECT * FROM carts WHERE user_id = $1', [userId]);
    if (existing.rows[0]) {
      return existing.rows[0];
    }
    const created = await db.query('INSERT INTO carts (user_id) VALUES ($1) RETURNING *', [userId]);
    return created.rows[0];
  },

  async getCartItems(cartId) {
    const query = `
      SELECT ci.id, ci.cart_id, ci.product_id, ci.quantity,
             p.name, p.price, p.stock, p.active
      FROM cart_items ci
      JOIN products p ON p.id = ci.product_id
      WHERE ci.cart_id = $1
      ORDER BY ci.id ASC
    `;
    const { rows } = await db.query(query, [cartId]);
    return rows;
  },

  async findItemById(itemId) {
    const { rows } = await db.query('SELECT * FROM cart_items WHERE id = $1', [itemId]);
    return rows[0] || null;
  },

  async findItemByCartAndProduct(cartId, productId) {
    const { rows } = await db.query('SELECT * FROM cart_items WHERE cart_id = $1 AND product_id = $2', [cartId, productId]);
    return rows[0] || null;
  },

  async createItem(cartId, productId, quantity) {
    const { rows } = await db.query(
      'INSERT INTO cart_items (cart_id, product_id, quantity) VALUES ($1, $2, $3) RETURNING *',
      [cartId, productId, quantity]
    );
    return rows[0];
  },

  async updateItemQuantity(itemId, quantity) {
    const { rows } = await db.query('UPDATE cart_items SET quantity = $1 WHERE id = $2 RETURNING *', [quantity, itemId]);
    return rows[0] || null;
  },

  async deleteItem(itemId) {
    const { rowCount } = await db.query('DELETE FROM cart_items WHERE id = $1', [itemId]);
    return rowCount > 0;
  },

  async clearCart(client, cartId) {
    const executor = client || db;
    await executor.query('DELETE FROM cart_items WHERE cart_id = $1', [cartId]);
  }
};
