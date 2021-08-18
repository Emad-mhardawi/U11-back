const express = require('express');
const router = express.Router();
const orderController = require('../controllers/OrderController');
router.post('/create-checkout-session',  orderController.checkoutSession);





module.exports = router;