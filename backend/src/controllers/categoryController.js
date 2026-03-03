const categoryService = require('../services/categoryService');

module.exports = {
  async getAll(req, res) {
    const categories = await categoryService.getAll();
    res.status(200).json(categories);
  },

  async create(req, res) {
    const category = await categoryService.create(req.body);
    res.status(201).json(category);
  },

  async update(req, res) {
    const category = await categoryService.update(Number(req.params.id), req.body);
    res.status(200).json(category);
  },

  async remove(req, res) {
    await categoryService.remove(Number(req.params.id));
    res.status(204).send();
  }
};
