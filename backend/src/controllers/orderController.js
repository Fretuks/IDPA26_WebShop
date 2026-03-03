const orderService = require('../services/orderService');

module.exports = {
  async checkout(req, res) {
    const order = await orderService.checkout(req.user.sub, req.body);
    res.status(201).json(order);
  },

  async getMyOrders(req, res) {
    const orders = await orderService.getMyOrders(req.user.sub);
    res.status(200).json(orders);
  },

  async getMyOrderById(req, res) {
    const order = await orderService.getMyOrderById(req.user.sub, Number(req.params.id));
    res.status(200).json(order);
  },

  async getAllAdmin(req, res) {
    const orders = await orderService.getAllOrdersAdmin();
    res.status(200).json(orders);
  }
};
