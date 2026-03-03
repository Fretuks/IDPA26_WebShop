const express = require('express');
const orderController = require('../controllers/orderController');
const auth = require('../middleware/authMiddleware');
const validateRequest = require('../middleware/validateRequest');
const asyncHandler = require('../utils/asyncHandler');
const { idParamValidator, checkoutValidator } = require('../validators/commonValidators');

const router = express.Router();

router.use(auth);
router.post('/checkout', checkoutValidator, validateRequest, asyncHandler(orderController.checkout));
router.get('/', asyncHandler(orderController.getMyOrders));
router.get('/:id', idParamValidator, validateRequest, asyncHandler(orderController.getMyOrderById));

module.exports = router;
