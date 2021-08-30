const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const protect = require('../middlewares/authMiddleware');

 router.post('/register', userController.postAddNewUser);
 router.post('/login', userController.postLoginUser);
 router.post('/forgotPassword',userController.forgotPassword);
 router.post('/resetPassword',userController.resetPassword);
 router.put('/updateUserProfile',protect, userController.updateUserProfile);
 router.get('/userInfo', userController.getUserInfo)


module.exports = router;  