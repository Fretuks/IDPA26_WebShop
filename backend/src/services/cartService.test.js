const test = require('node:test');
const assert = require('node:assert/strict');

const cartService = require('./cartService');
const cartRepository = require('../repositories/cartRepository');
const productRepository = require('../repositories/productRepository');

const originalCartRepository = {
  getOrCreateByUserId: cartRepository.getOrCreateByUserId,
  getCartItems: cartRepository.getCartItems,
  findItemByCartAndProduct: cartRepository.findItemByCartAndProduct,
  updateItemQuantity: cartRepository.updateItemQuantity,
  createItem: cartRepository.createItem,
  findItemById: cartRepository.findItemById,
  deleteItem: cartRepository.deleteItem
};

const originalProductRepository = {
  findById: productRepository.findById
};

test.afterEach(() => {
  cartRepository.getOrCreateByUserId = originalCartRepository.getOrCreateByUserId;
  cartRepository.getCartItems = originalCartRepository.getCartItems;
  cartRepository.findItemByCartAndProduct = originalCartRepository.findItemByCartAndProduct;
  cartRepository.updateItemQuantity = originalCartRepository.updateItemQuantity;
  cartRepository.createItem = originalCartRepository.createItem;
  cartRepository.findItemById = originalCartRepository.findItemById;
  cartRepository.deleteItem = originalCartRepository.deleteItem;
  productRepository.findById = originalProductRepository.findById;
});

test('getCartForUser enriches the cart with items and computed total', async () => {
  cartRepository.getOrCreateByUserId = async () => ({ id: 8, user_id: 3 });
  cartRepository.getCartItems = async () => [
    { id: 1, price: '19.90', quantity: 2 },
    { id: 2, price: '5.00', quantity: 1 }
  ];

  const cart = await cartService.getCartForUser(3);

  assert.equal(cart.id, 8);
  assert.equal(cart.totalAmount, 44.8);
  assert.equal(cart.items.length, 2);
});

test('addItem updates existing cart items to the merged quantity', async () => {
  const operations = [];

  cartRepository.getOrCreateByUserId = async () => ({ id: 5, user_id: 2 });
  productRepository.findById = async () => ({ id: 6, stock: 10, active: true });
  cartRepository.findItemByCartAndProduct = async () => ({ id: 12, quantity: 3 });
  cartRepository.updateItemQuantity = async (itemId, quantity) => {
    operations.push({ itemId, quantity });
  };
  cartRepository.getCartItems = async () => [];

  const cart = await cartService.addItem(2, 6, 4);

  assert.deepEqual(operations, [{ itemId: 12, quantity: 7 }]);
  assert.equal(cart.totalAmount, 0);
});

test('updateItem rejects items that do not belong to the current user cart', async () => {
  cartRepository.getOrCreateByUserId = async () => ({ id: 5, user_id: 2 });
  cartRepository.findItemById = async () => ({ id: 13, cart_id: 999, product_id: 4 });

  await assert.rejects(() => cartService.updateItem(2, 13, 1), {
    message: 'Cart item not found',
    statusCode: 404
  });
});

test('removeItem deletes the item and returns the refreshed cart', async () => {
  const deletedIds = [];

  cartRepository.getOrCreateByUserId = async () => ({ id: 5, user_id: 2 });
  cartRepository.findItemById = async () => ({ id: 13, cart_id: 5, product_id: 4 });
  cartRepository.deleteItem = async (itemId) => {
    deletedIds.push(itemId);
  };
  cartRepository.getCartItems = async () => [];

  const cart = await cartService.removeItem(2, 13);

  assert.deepEqual(deletedIds, [13]);
  assert.equal(cart.id, 5);
  assert.equal(cart.totalAmount, 0);
});
