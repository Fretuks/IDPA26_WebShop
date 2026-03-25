const express = require('express');
const userAddressController = require('../controllers/userAddressController');
const userController = require('../controllers/userController');
const auth = require('../middleware/authMiddleware');
const validateRequest = require('../middleware/validateRequest');
const asyncHandler = require('../utils/asyncHandler');
const { idParamValidator, addressIdParamValidator, addressValidator } = require('../validators/commonValidators');
const { updateProfileValidator, changePasswordValidator } = require('../validators/authValidators');

const router = express.Router();

router.use(auth);
router.get('/me', asyncHandler(userController.getMe));
router.patch('/me', updateProfileValidator, validateRequest, asyncHandler(userController.updateMe));
router.patch('/me/password', changePasswordValidator, validateRequest, asyncHandler(userController.changePassword));
router.get('/me/addresses', asyncHandler(userAddressController.getMyAddresses));
router.post('/me/addresses', addressValidator, validateRequest, asyncHandler(userAddressController.createAddress));
router.put('/me/addresses/:id', [...idParamValidator, ...addressValidator], validateRequest, asyncHandler(userAddressController.updateAddress));
router.delete('/me/addresses/:id', idParamValidator, validateRequest, asyncHandler(userAddressController.deleteAddress));
router.patch('/me/default-shipping/:addressId', addressIdParamValidator, validateRequest, asyncHandler(userAddressController.setDefaultShipping));
router.patch('/me/default-billing/:addressId', addressIdParamValidator, validateRequest, asyncHandler(userAddressController.setDefaultBilling));

module.exports = router;
