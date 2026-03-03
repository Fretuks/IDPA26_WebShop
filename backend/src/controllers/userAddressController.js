const addressService = require('../services/addressService');

module.exports = {
  async getMyAddresses(req, res) {
    const payload = await addressService.getMyAddresses(req.user.sub);
    res.status(200).json(payload);
  },

  async createAddress(req, res) {
    const address = await addressService.createAddress(req.user.sub, req.body);
    res.status(201).json(address);
  },

  async updateAddress(req, res) {
    const address = await addressService.updateAddress(req.user.sub, Number(req.params.id), req.body);
    res.status(200).json(address);
  },

  async deleteAddress(req, res) {
    await addressService.deleteAddress(req.user.sub, Number(req.params.id));
    res.status(204).send();
  },

  async setDefaultShipping(req, res) {
    const payload = await addressService.setDefaultShippingAddress(req.user.sub, Number(req.params.addressId));
    res.status(200).json(payload);
  },

  async setDefaultBilling(req, res) {
    const payload = await addressService.setDefaultBillingAddress(req.user.sub, Number(req.params.addressId));
    res.status(200).json(payload);
  }
};
