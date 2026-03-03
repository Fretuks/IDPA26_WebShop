const cartService = require('../services/cartService');

module.exports = {
  async getCart(req, res) {
    const cart = await cartService.getCartForUser(req.user.sub);
    res.status(200).json(cart);
  },

  async addItem(req, res) {
    const cart = await cartService.addItem(req.user.sub, req.body.productId, req.body.quantity);
    res.status(200).json(cart);
  },

  async updateItem(req, res) {
    const cart = await cartService.updateItem(req.user.sub, Number(req.params.id), req.body.quantity);
    res.status(200).json(cart);
  },

  async removeItem(req, res) {
    const cart = await cartService.removeItem(req.user.sub, Number(req.params.id));
    res.status(200).json(cart);
  }
};
