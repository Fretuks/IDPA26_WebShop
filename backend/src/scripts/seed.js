const bcrypt = require('bcrypt');
const db = require('../config/db');
const env = require('../config/env');

const categories = [
  ['Elektronik', 'Geräte und Zubehör'],
  ['Bücher', 'Fach- und Freizeitliteratur'],
  ['Sport', 'Sportartikel'],
  ['Haushalt', 'Haushaltsgeräte'],
  ['Mode', 'Kleidung und Accessoires'],
  ['Beauty', 'Pflegeprodukte'],
  ['Spielzeug', 'Kinder und Lernspielzeug'],
  ['Garten', 'Gartenbedarf'],
  ['Office', 'Bürobedarf'],
  ['Lebensmittel', 'Haltbare Produkte']
];

function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function seed() {
  const client = await db.getClient();
  try {
    await client.query('BEGIN');

    const schema = await db.query('SELECT table_name FROM information_schema.tables WHERE table_schema = $1', ['public']);
    if (!schema.rows.some((r) => r.table_name === 'users')) {
      throw new Error('Schema missing. Run backend/sql/schema.sql first.');
    }

    await client.query('TRUNCATE order_items, orders, cart_items, carts, addresses, products, categories, users RESTART IDENTITY CASCADE');

    for (const [name, description] of categories) {
      await client.query('INSERT INTO categories (name, description) VALUES ($1, $2)', [name, description]);
    }

    const categoryRows = await client.query('SELECT id FROM categories ORDER BY id ASC');

    for (let i = 1; i <= 100; i += 1) {
      const category = categoryRows.rows[(i - 1) % categoryRows.rows.length];
      await client.query(
        `INSERT INTO products (name, description, price, stock, category_id, active)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          `Produkt ${i}`,
          `Beschreibung für Produkt ${i}`,
          (random(500, 20000) / 100).toFixed(2),
          random(5, 200),
          category.id,
          true
        ]
      );
    }

    const adminPassword = await bcrypt.hash('Admin1234!', env.bcryptRounds);
    const testPassword = await bcrypt.hash('Test1234!', env.bcryptRounds);

    const adminUser = await client.query(
      `INSERT INTO users (firstname, lastname, email, password_hash, role)
       VALUES ('Admin', 'User', 'admin@webshop.local', $1, 'ADMIN')
       RETURNING id`,
      [adminPassword]
    );

    const testUser = await client.query(
      `INSERT INTO users (firstname, lastname, email, password_hash, role)
       VALUES ('Test', 'User', 'test@webshop.local', $1, 'CUSTOMER')
       RETURNING id`,
      [testPassword]
    );

    await client.query('INSERT INTO carts (user_id) VALUES ($1), ($2)', [adminUser.rows[0].id, testUser.rows[0].id]);

    await client.query('COMMIT');
    console.log('Seed completed successfully.');
    console.log('Admin login: admin@webshop.local / Admin1234!');
    console.log('Test login: test@webshop.local / Test1234!');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Seed failed:', error.message);
    process.exitCode = 1;
  } finally {
    client.release();
    await db.pool.end();
  }
}

seed();
