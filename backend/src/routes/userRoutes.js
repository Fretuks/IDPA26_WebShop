const express = require('express');
const userAddressController = require('../controllers/userAddressController');
const auth = require('../middleware/authMiddleware');
const validateRequest = require('../middleware/validateRequest');
const asyncHandler = require('../utils/asyncHandler');
const { idParamValidator, addressIdParamValidator, addressValidator } = require('../validators/commonValidators');

const router = express.Router();

router.use(auth);
router.get('/me/addresses', asyncHandler(userAddressController.getMyAddresses));
router.post('/me/addresses', addressValidator, validateRequest, asyncHandler(userAddressController.createAddress));
router.put('/me/addresses/:id', [...idParamValidator, ...addressValidator], validateRequest, asyncHandler(userAddressController.updateAddress));
router.delete('/me/addresses/:id', idParamValidator, validateRequest, asyncHandler(userAddressController.deleteAddress));
router.patch('/me/default-shipping/:addressId', addressIdParamValidator, validateRequest, asyncHandler(userAddressController.setDefaultShipping));
router.patch('/me/default-billing/:addressId', addressIdParamValidator, validateRequest, asyncHandler(userAddressController.setDefaultBilling));

module.exports = router;
