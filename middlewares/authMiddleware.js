const jwt = require("jsonwebtoken");
const User = require("../models/UserModel");
const asyncHandler = require("express-async-handler");

const protect = asyncHandler(async (req, res, next) => {
  let token = req.headers.token;
  
  if (token && token.startsWith("Bearer")) {
    try {
      token = token.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select('-password');
      req.user = user
      next()

    } catch (err) {
      res.status(401);
      throw new Error('not authorized, token failed')
    }
  }
  
  if (!token) {
    res.status(401);
    throw new Error("not authorized, no access token");
}
});

module.exports = protect;
