const productService = require('../services/productService');

module.exports = {
  async getAll(req, res) {
    const products = await productService.getAllActive();
    res.status(200).json(products);
  },

  async getById(req, res) {
    const product = await productService.getById(Number(req.params.id));
    res.status(200).json(product);
  },

  async create(req, res) {
    const product = await productService.create(req.body);
    res.status(201).json(product);
  },

  async update(req, res) {
    const product = await productService.update(Number(req.params.id), req.body);
    res.status(200).json(product);
  },

  async remove(req, res) {
    await productService.remove(Number(req.params.id));
    res.status(204).send();
  }
};
