const AppError = require('../utils/AppError');
const cartRepository = require('../repositories/cartRepository');
const productRepository = require('../repositories/productRepository');

async function enrichCart(cart) {
  const items = await cartRepository.getCartItems(cart.id);
  const total = items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
  return { ...cart, items, totalAmount: Number(total.toFixed(2)) };
}

module.exports = {
  async getCartForUser(userId) {
    const cart = await cartRepository.getOrCreateByUserId(userId);
    return enrichCart(cart);
  },

  async addItem(userId, productId, quantity) {
    const cart = await cartRepository.getOrCreateByUserId(userId);
    const product = await productRepository.findById(productId);
    if (!product || !product.active) {
      throw new AppError('Product not found', 404);
    }

    const existing = await cartRepository.findItemByCartAndProduct(cart.id, productId);
    const targetQuantity = existing ? existing.quantity + quantity : quantity;

    if (targetQuantity > product.stock) {
      throw new AppError('Insufficient stock for requested quantity', 400);
    }

    if (existing) {
      await cartRepository.updateItemQuantity(existing.id, targetQuantity);
    } else {
      await cartRepository.createItem(cart.id, productId, quantity);
    }

    return this.getCartForUser(userId);
  },

  async updateItem(userId, itemId, quantity) {
    const cart = await cartRepository.getOrCreateByUserId(userId);
    const item = await cartRepository.findItemById(itemId);

    if (!item || item.cart_id !== cart.id) {
      throw new AppError('Cart item not found', 404);
    }

    const product = await productRepository.findById(item.product_id);
    if (!product || !product.active) {
      throw new AppError('Product not available', 400);
    }

    if (quantity > product.stock) {
      throw new AppError('Insufficient stock for requested quantity', 400);
    }

    await cartRepository.updateItemQuantity(itemId, quantity);
    return this.getCartForUser(userId);
  },

  async removeItem(userId, itemId) {
    const cart = await cartRepository.getOrCreateByUserId(userId);
    const item = await cartRepository.findItemById(itemId);

    if (!item || item.cart_id !== cart.id) {
      throw new AppError('Cart item not found', 404);
    }

    await cartRepository.deleteItem(itemId);
    return this.getCartForUser(userId);
  }
};
