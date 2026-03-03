const AppError = require('../utils/AppError');
const categoryRepository = require('../repositories/categoryRepository');

module.exports = {
  getAll() {
    return categoryRepository.findAll();
  },

  async create(data) {
    return categoryRepository.create(data);
  },

  async update(id, data) {
    const updated = await categoryRepository.update(id, data);
    if (!updated) {
      throw new AppError('Category not found', 404);
    }
    return updated;
  },

  async remove(id) {
    const deleted = await categoryRepository.remove(id);
    if (!deleted) {
      throw new AppError('Category not found', 404);
    }
  }
};
