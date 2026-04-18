const test = require('node:test');
const assert = require('node:assert/strict');

const db = require('../config/db');
const orderService = require('./orderService');
const cartRepository = require('../repositories/cartRepository');
const orderRepository = require('../repositories/orderRepository');
const productRepository = require('../repositories/productRepository');
const userRepository = require('../repositories/userRepository');
const addressRepository = require('../repositories/addressRepository');
const { OrderStatus } = require('../models/enums');

const originalDb = {
  getClient: db.getClient
};

const originalCartRepository = {
  clearCart: cartRepository.clearCart
};

const originalOrderRepository = {
  createOrder: orderRepository.createOrder,
  createOrderItem: orderRepository.createOrderItem,
  findItemsByOrderId: orderRepository.findItemsByOrderId,
  findByIdForUser: orderRepository.findByIdForUser,
  updateStatus: orderRepository.updateStatus
};

const originalProductRepository = {
  updateStock: productRepository.updateStock
};

const originalUserRepository = {
  findById: userRepository.findById
};

const originalAddressRepository = {
  findById: addressRepository.findById
};

function createClient({ cart, items }) {
  const executed = [];
  let released = false;

  return {
    client: {
      async query(sql, params) {
        executed.push({ sql, params });

        if (sql === 'BEGIN' || sql === 'COMMIT' || sql === 'ROLLBACK') {
          return { rows: [] };
        }

        if (sql.includes('SELECT * FROM carts')) {
          return { rows: cart ? [cart] : [] };
        }

        if (sql.includes('SELECT ci.*, p.price, p.stock, p.active')) {
          return { rows: items };
        }

        throw new Error(`Unexpected query: ${sql}`);
      },
      release() {
        released = true;
      }
    },
    get executed() {
      return executed;
    },
    get released() {
      return released;
    }
  };
}

test.afterEach(() => {
  db.getClient = originalDb.getClient;
  cartRepository.clearCart = originalCartRepository.clearCart;
  orderRepository.createOrder = originalOrderRepository.createOrder;
  orderRepository.createOrderItem = originalOrderRepository.createOrderItem;
  orderRepository.findItemsByOrderId = originalOrderRepository.findItemsByOrderId;
  orderRepository.findByIdForUser = originalOrderRepository.findByIdForUser;
  orderRepository.updateStatus = originalOrderRepository.updateStatus;
  productRepository.updateStock = originalProductRepository.updateStock;
  userRepository.findById = originalUserRepository.findById;
  addressRepository.findById = originalAddressRepository.findById;
});

test('checkout rejects missing default addresses before any transaction starts', async () => {
  const clientState = createClient({ cart: null, items: [] });

  db.getClient = async () => clientState.client;
  userRepository.findById = async () => ({
    id: 5,
    default_shipping_address_id: null,
    default_billing_address_id: null
  });

  await assert.rejects(() => orderService.checkout(5, { paymentMethod: 'INVOICE' }), {
    message: 'Missing default shipping/billing address. Provide addressId or set defaults.',
    statusCode: 400
  });

  assert.equal(clientState.released, false);
  assert.equal(clientState.executed.length, 0);
});

test('checkout rolls back on insufficient stock and releases the db client', async () => {
  const clientState = createClient({
    cart: { id: 22, user_id: 5 },
    items: [{ product_id: 3, quantity: 5, stock: 2, active: true, price: '19.90' }]
  });

  db.getClient = async () => clientState.client;
  userRepository.findById = async () => ({
    id: 5,
    default_shipping_address_id: 7,
    default_billing_address_id: 8
  });
  addressRepository.findById = async (addressId) => ({
    id: addressId,
    user_id: 5
  });

  await assert.rejects(() => orderService.checkout(5, { paymentMethod: 'INVOICE' }), {
    message: 'Insufficient stock for product 3',
    statusCode: 400
  });

  assert.equal(clientState.released, true);
  assert.equal(clientState.executed[0].sql, 'BEGIN');
  assert.equal(clientState.executed.at(-1).sql, 'ROLLBACK');
});

test('checkout creates order items, updates stock, clears cart and commits', async () => {
  const clientState = createClient({
    cart: { id: 22, user_id: 5 },
    items: [
      { product_id: 3, quantity: 2, stock: 5, active: true, price: '19.90' },
      { product_id: 4, quantity: 1, stock: 8, active: true, price: '10.00' }
    ]
  });
  const operations = [];

  db.getClient = async () => clientState.client;
  userRepository.findById = async () => ({
    id: 5,
    default_shipping_address_id: 7,
    default_billing_address_id: 8
  });
  addressRepository.findById = async (addressId) => ({
    id: addressId,
    user_id: 5,
    street: 'Main'
  });
  orderRepository.createOrder = async (client, payload) => {
    operations.push({ type: 'createOrder', payload });
    assert.equal(client, clientState.client);
    return { id: 70, ...payload };
  };
  orderRepository.createOrderItem = async (client, payload) => {
    operations.push({ type: 'createOrderItem', payload });
    assert.equal(client, clientState.client);
  };
  productRepository.updateStock = async (client, productId, stock) => {
    operations.push({ type: 'updateStock', productId, stock });
    assert.equal(client, clientState.client);
  };
  cartRepository.clearCart = async (client, cartId) => {
    operations.push({ type: 'clearCart', cartId });
    assert.equal(client, clientState.client);
  };
  orderRepository.findItemsByOrderId = async (orderId) => {
    operations.push({ type: 'findItemsByOrderId', orderId });
    return [{ order_id: orderId, product_id: 3, quantity: 2 }];
  };

  const order = await orderService.checkout(5, { paymentMethod: 'PAYPAL' });

  assert.equal(clientState.executed[0].sql, 'BEGIN');
  assert.equal(clientState.executed.at(-1).sql, 'COMMIT');
  assert.equal(clientState.released, true);
  assert.deepEqual(order, {
    id: 70,
    userId: 5,
    totalAmount: 49.8,
    paymentMethod: 'PAYPAL',
    shippingAddressSnapshot: { id: 7, user_id: 5, street: 'Main' },
    billingAddressSnapshot: { id: 8, user_id: 5, street: 'Main' },
    status: OrderStatus.OPEN,
    items: [{ order_id: 70, product_id: 3, quantity: 2 }]
  });
  assert.deepEqual(operations, [
    {
      type: 'createOrder',
      payload: {
        userId: 5,
        totalAmount: 49.8,
        paymentMethod: 'PAYPAL',
        shippingAddressSnapshot: { id: 7, user_id: 5, street: 'Main' },
        billingAddressSnapshot: { id: 8, user_id: 5, street: 'Main' },
        status: OrderStatus.OPEN
      }
    },
    {
      type: 'createOrderItem',
      payload: {
        orderId: 70,
        productId: 3,
        quantity: 2,
        priceAtPurchase: '19.90'
      }
    },
    { type: 'updateStock', productId: 3, stock: 3 },
    {
      type: 'createOrderItem',
      payload: {
        orderId: 70,
        productId: 4,
        quantity: 1,
        priceAtPurchase: '10.00'
      }
    },
    { type: 'updateStock', productId: 4, stock: 7 },
    { type: 'clearCart', cartId: 22 },
    { type: 'findItemsByOrderId', orderId: 70 }
  ]);
});

test('getMyOrderById rejects unknown orders', async () => {
  orderRepository.findByIdForUser = async () => null;

  await assert.rejects(() => orderService.getMyOrderById(5, 70), {
    message: 'Order not found',
    statusCode: 404
  });
});

test('updateStatus rejects unknown orders', async () => {
  orderRepository.updateStatus = async () => null;

  await assert.rejects(() => orderService.updateStatus(70, OrderStatus.PAID), {
    message: 'Order not found',
    statusCode: 404
  });
});
