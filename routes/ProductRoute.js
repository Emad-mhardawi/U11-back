const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const productController = require('../controllers/ProductController')
const protect = require('../middlewares/authMiddleware');

 router.post('/add-new-product', protect, productController.postAddNewProduct);
 router.get('/getProducts', productController.getProducts);
 router.get('/get-Latest-products', productController.getLatestProducts);
 router.get('/getProduct', productController.getProduct),
 router.post('/add-product-review', productController.postAddReview);
 

module.exports = router;  