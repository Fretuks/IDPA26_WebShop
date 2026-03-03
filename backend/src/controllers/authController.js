const authService = require('../services/authService');

module.exports = {
  async register(req, res) {
    const user = await authService.register(req.body);
    res.status(201).json(user);
  },

  async login(req, res) {
    const payload = await authService.login(req.body.email, req.body.password);
    res.status(200).json(payload);
  }
};
