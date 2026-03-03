const AppError = require('../utils/AppError');
const productRepository = require('../repositories/productRepository');
const categoryRepository = require('../repositories/categoryRepository');

module.exports = {
  getAllActive() {
    return productRepository.findAllActive();
  },

  async getById(id) {
    const product = await productRepository.findById(id);
    if (!product || !product.active) {
      throw new AppError('Product not found', 404);
    }
    return product;
  },

  async create(data) {
    if (data.stock < 0) {
      throw new AppError('Stock cannot be negative', 400);
    }
    const category = await categoryRepository.findById(data.categoryId);
    if (!category) {
      throw new AppError('Category not found', 404);
    }
    return productRepository.create(data);
  },

  async update(id, data) {
    if (data.stock < 0) {
      throw new AppError('Stock cannot be negative', 400);
    }
    const category = await categoryRepository.findById(data.categoryId);
    if (!category) {
      throw new AppError('Category not found', 404);
    }
    const updated = await productRepository.update(id, data);
    if (!updated) {
      throw new AppError('Product not found', 404);
    }
    return updated;
  },

  async remove(id) {
    const deleted = await productRepository.remove(id);
    if (!deleted) {
      throw new AppError('Product not found', 404);
    }
  }
};
