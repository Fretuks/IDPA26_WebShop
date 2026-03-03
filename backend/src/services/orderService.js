const db = require('../config/db');
const AppError = require('../utils/AppError');
const cartRepository = require('../repositories/cartRepository');
const orderRepository = require('../repositories/orderRepository');
const productRepository = require('../repositories/productRepository');
const userRepository = require('../repositories/userRepository');
const addressRepository = require('../repositories/addressRepository');
const { OrderStatus } = require('../models/enums');

async function resolveCheckoutAddresses(userId, checkoutPayload) {
  const user = await userRepository.findById(userId);

  const shippingId = checkoutPayload.shippingAddressId || checkoutPayload.addressId || user.default_shipping_address_id;
  const billingId = checkoutPayload.billingAddressId || checkoutPayload.addressId || user.default_billing_address_id;

  if (!shippingId || !billingId) {
    throw new AppError('Missing default shipping/billing address. Provide addressId or set defaults.', 400);
  }

  const shippingAddress = await addressRepository.findById(shippingId);
  const billingAddress = await addressRepository.findById(billingId);

  if (!shippingAddress || shippingAddress.user_id !== userId) {
    throw new AppError('Invalid shipping address', 400);
  }

  if (!billingAddress || billingAddress.user_id !== userId) {
    throw new AppError('Invalid billing address', 400);
  }

  return { shippingAddress, billingAddress };
}

module.exports = {
  async checkout(userId, payload) {
    const client = await db.getClient();
    const { shippingAddress, billingAddress } = await resolveCheckoutAddresses(userId, payload);

    try {
      await client.query('BEGIN');

      const cartResult = await client.query('SELECT * FROM carts WHERE user_id = $1', [userId]);
      const cart = cartResult.rows[0];

      if (!cart) {
        throw new AppError('Cart is empty', 400);
      }

      const itemsResult = await client.query(
        `SELECT ci.*, p.price, p.stock, p.active
         FROM cart_items ci
         JOIN products p ON p.id = ci.product_id
         WHERE ci.cart_id = $1
         FOR UPDATE`,
        [cart.id]
      );

      const items = itemsResult.rows;
      if (items.length === 0) {
        throw new AppError('Cart is empty', 400);
      }

      let totalAmount = 0;
      for (const item of items) {
        if (!item.active) {
          throw new AppError(`Product ${item.product_id} is inactive`, 400);
        }
        if (item.quantity > item.stock) {
          throw new AppError(`Insufficient stock for product ${item.product_id}`, 400);
        }
        totalAmount += Number(item.price) * item.quantity;
      }

      const order = await orderRepository.createOrder(client, {
        userId,
        totalAmount: Number(totalAmount.toFixed(2)),
        paymentMethod: payload.paymentMethod,
        shippingAddressSnapshot: shippingAddress,
        billingAddressSnapshot: billingAddress,
        status: OrderStatus.OPEN
      });

      for (const item of items) {
        await orderRepository.createOrderItem(client, {
          orderId: order.id,
          productId: item.product_id,
          quantity: item.quantity,
          priceAtPurchase: item.price
        });

        await productRepository.updateStock(client, item.product_id, item.stock - item.quantity);
      }

      await cartRepository.clearCart(client, cart.id);
      await client.query('COMMIT');

      const orderItems = await orderRepository.findItemsByOrderId(order.id);
      return { ...order, items: orderItems };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  async getMyOrders(userId) {
    return orderRepository.findByUserId(userId);
  },

  async getMyOrderById(userId, orderId) {
    const order = await orderRepository.findByIdForUser(orderId, userId);
    if (!order) {
      throw new AppError('Order not found', 404);
    }
    const items = await orderRepository.findItemsByOrderId(order.id);
    return { ...order, items };
  },

  async getAllOrdersAdmin() {
    return orderRepository.findAll();
  }
};
