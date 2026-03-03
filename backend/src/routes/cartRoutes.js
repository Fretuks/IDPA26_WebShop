const express = require('express');
const cartController = require('../controllers/cartController');
const auth = require('../middleware/authMiddleware');
const validateRequest = require('../middleware/validateRequest');
const asyncHandler = require('../utils/asyncHandler');
const { idParamValidator, addCartItemValidator, updateCartItemValidator } = require('../validators/commonValidators');

const router = express.Router();

router.use(auth);
router.get('/', asyncHandler(cartController.getCart));
router.post('/items', addCartItemValidator, validateRequest, asyncHandler(cartController.addItem));
router.put('/items/:id', [...idParamValidator, ...updateCartItemValidator], validateRequest, asyncHandler(cartController.updateItem));
router.delete('/items/:id', idParamValidator, validateRequest, asyncHandler(cartController.removeItem));

module.exports = router;
