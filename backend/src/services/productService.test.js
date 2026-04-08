const test = require('node:test');
const assert = require('node:assert/strict');

const productRepository = require('../repositories/productRepository');
const categoryRepository = require('../repositories/categoryRepository');
const productService = require('./productService');

const originalProductRepository = {
  findAll: productRepository.findAll,
  findAllActive: productRepository.findAllActive,
  findById: productRepository.findById,
  create: productRepository.create,
  update: productRepository.update,
  remove: productRepository.remove
};

const originalCategoryRepository = {
  findById: categoryRepository.findById
};

test.afterEach(() => {
  productRepository.findAll = originalProductRepository.findAll;
  productRepository.findAllActive = originalProductRepository.findAllActive;
  productRepository.findById = originalProductRepository.findById;
  productRepository.create = originalProductRepository.create;
  productRepository.update = originalProductRepository.update;
  productRepository.remove = originalProductRepository.remove;
  categoryRepository.findById = originalCategoryRepository.findById;
});

test('getById rejects inactive products', async () => {
  productRepository.findById = async () => ({ id: 7, active: false });

  await assert.rejects(() => productService.getById(7), {
    message: 'Product not found',
    statusCode: 404
  });
});

test('create rejects negative stock before touching repositories', async () => {
  let categoryLookupCalled = false;
  categoryRepository.findById = async () => {
    categoryLookupCalled = true;
    return { id: 1 };
  };

  await assert.rejects(
    () =>
      productService.create({
        name: 'Demo',
        price: 10,
        stock: -1,
        categoryId: 1
      }),
    {
      message: 'Stock cannot be negative',
      statusCode: 400
    }
  );

  assert.equal(categoryLookupCalled, false);
});

test('create rejects unknown categories', async () => {
  categoryRepository.findById = async () => null;

  await assert.rejects(
    () =>
      productService.create({
        name: 'Demo',
        price: 10,
        stock: 3,
        categoryId: 999
      }),
    {
      message: 'Category not found',
      statusCode: 404
    }
  );
});

test('update returns the updated product when validation passes', async () => {
  categoryRepository.findById = async () => ({ id: 3 });
  productRepository.update = async (id, data) => ({ id, ...data });

  const updated = await productService.update(5, {
    name: 'Keyboard',
    price: 129,
    stock: 8,
    categoryId: 3,
    active: true
  });

  assert.deepEqual(updated, {
    id: 5,
    name: 'Keyboard',
    price: 129,
    stock: 8,
    categoryId: 3,
    active: true
  });
});
