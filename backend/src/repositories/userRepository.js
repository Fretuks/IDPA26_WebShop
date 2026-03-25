const db = require('../config/db');
const { UserRole } = require('../models/enums');

module.exports = {
  async create({ firstname, lastname, email, passwordHash, role = UserRole.CUSTOMER, phone = null }) {
    const query = `
      INSERT INTO users (firstname, lastname, email, password_hash, role, phone)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, firstname, lastname, email, phone, role, created_at,
                default_shipping_address_id, default_billing_address_id
    `;
    const values = [firstname, lastname, email, passwordHash, role, phone];
    const { rows } = await db.query(query, values);
    return rows[0];
  },

  async findByEmail(email) {
    const { rows } = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    return rows[0] || null;
  },

  async findById(id) {
    const { rows } = await db.query(
      `SELECT id, firstname, lastname, email, phone, role, created_at,
              default_shipping_address_id, default_billing_address_id
       FROM users WHERE id = $1`,
      [id]
    );
    return rows[0] || null;
  },

  async updateProfile(id, { firstname, lastname, phone }) {
    const { rows } = await db.query(
      `UPDATE users
       SET firstname = $1,
           lastname = $2,
           phone = $3
       WHERE id = $4
       RETURNING id, firstname, lastname, email, phone, role, created_at,
                 default_shipping_address_id, default_billing_address_id`,
      [firstname, lastname, phone, id]
    );
    return rows[0] || null;
  },

  async updatePasswordHash(id, passwordHash) {
    const { rows } = await db.query(
      `UPDATE users
       SET password_hash = $1
       WHERE id = $2
       RETURNING id`,
      [passwordHash, id]
    );
    return rows[0] || null;
  },

  async setDefaultShippingAddress(userId, addressId) {
    const { rows } = await db.query(
      'UPDATE users SET default_shipping_address_id = $1 WHERE id = $2 RETURNING *',
      [addressId, userId]
    );
    return rows[0] || null;
  },

  async setDefaultBillingAddress(userId, addressId) {
    const { rows } = await db.query(
      'UPDATE users SET default_billing_address_id = $1 WHERE id = $2 RETURNING *',
      [addressId, userId]
    );
    return rows[0] || null;
  },

  async clearDefaultAddressReferences(addressId) {
    await db.query(
      `UPDATE users
       SET default_shipping_address_id = CASE WHEN default_shipping_address_id = $1 THEN NULL ELSE default_shipping_address_id END,
           default_billing_address_id = CASE WHEN default_billing_address_id = $1 THEN NULL ELSE default_billing_address_id END
       WHERE default_shipping_address_id = $1 OR default_billing_address_id = $1`,
      [addressId]
    );
  }
};
