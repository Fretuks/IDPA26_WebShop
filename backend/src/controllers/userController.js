const userService = require('../services/userService');

module.exports = {
  async getMe(req, res) {
    const user = await userService.getById(req.user.sub);
    res.status(200).json(user);
  },

  async updateMe(req, res) {
    const user = await userService.updateProfile(req.user.sub, req.body);
    res.status(200).json(user);
  },

  async changePassword(req, res) {
    await userService.changePassword(req.user.sub, req.body.currentPassword, req.body.newPassword);
    res.status(204).send();
  }
};
