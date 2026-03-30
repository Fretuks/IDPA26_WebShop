const orderService = require('../services/orderService');
const productService = require('../services/productService');
const userService = require('../services/userService');

module.exports = {
  async getOrders(req, res) {
    const orders = await orderService.getAllOrdersAdmin();
    res.status(200).json(orders);
  },

  async getProducts(req, res) {
    const products = await productService.getAllAdmin();
    res.status(200).json(products);
  },

  async getUsers(req, res) {
    const users = await userService.getAllAdmin();
    res.status(200).json(users);
  },

  async updateOrderStatus(req, res) {
    const order = await orderService.updateStatus(Number(req.params.id), req.body.status);
    res.status(200).json(order);
  },

  async updateUserRole(req, res) {
    const user = await userService.updateRole(Number(req.params.id), req.body.role, req.user.id);
    res.status(200).json(user);
  }
};
