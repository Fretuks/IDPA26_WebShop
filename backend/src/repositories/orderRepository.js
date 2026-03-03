const db = require('../config/db');

module.exports = {
  async createOrder(client, {
    userId,
    totalAmount,
    paymentMethod,
    status = 'OPEN',
    shippingAddressSnapshot,
    billingAddressSnapshot
  }) {
    const query = `
      INSERT INTO orders (user_id, total_amount, payment_method, status, shipping_address_snapshot, billing_address_snapshot)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const { rows } = await client.query(query, [
      userId,
      totalAmount,
      paymentMethod,
      status,
      shippingAddressSnapshot,
      billingAddressSnapshot
    ]);
    return rows[0];
  },

  async createOrderItem(client, { orderId, productId, quantity, priceAtPurchase }) {
    const query = `
      INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const { rows } = await client.query(query, [orderId, productId, quantity, priceAtPurchase]);
    return rows[0];
  },

  async findByUserId(userId) {
    const { rows } = await db.query('SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
    return rows;
  },

  async findByIdForUser(id, userId) {
    const { rows } = await db.query('SELECT * FROM orders WHERE id = $1 AND user_id = $2', [id, userId]);
    return rows[0] || null;
  },

  async findAll() {
    const query = `
      SELECT o.*, u.firstname, u.lastname, u.email
      FROM orders o
      JOIN users u ON u.id = o.user_id
      ORDER BY o.created_at DESC
    `;
    const { rows } = await db.query(query);
    return rows;
  },

  async findItemsByOrderId(orderId) {
    const query = `
      SELECT oi.*, p.name AS product_name
      FROM order_items oi
      JOIN products p ON p.id = oi.product_id
      WHERE oi.order_id = $1
      ORDER BY oi.id ASC
    `;
    const { rows } = await db.query(query, [orderId]);
    return rows;
  }
};
