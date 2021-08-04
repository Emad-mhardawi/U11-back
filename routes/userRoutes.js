const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const protect = require('../middlewares/authMiddleware');

 router.post('/register', userController.postAddNewUser);
 router.post('/login', userController.postLoginUser);



module.exports = router;  