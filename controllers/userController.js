const User = require("../models/UserModel");
const asyncHandler = require("express-async-handler");
const generateToken = require("../utils/generateToken");
const bcrypt = require('bcrypt');
const nodemailer = require("nodemailer");
const sendgridTransport = require("nodemailer-sendgrid-transport");



// initialize nodemailer transporter
const transporter = nodemailer.createTransport(
  sendgridTransport({
    auth: {
      api_key: process.env.SEND_GRID_KEY,
    },
  })
);





//@ route: POST/  /register
//@ description: add new user
//@ access: public
exports.postAddNewUser = asyncHandler(async (req, res, next) => {
  const { email, password, confirmPassword } = req.body;
  if (!email) {
    res.status(400);
    throw new Error("email is required");
  }

  if (!password || password.length < 6) {
    res.status(400);
    throw new Error(
      "password is required and have to be at least 6 characters long"
    );
  }

  if (password !== confirmPassword) {
    res.status(400);
    throw new Error("password dose not match");
  }

  const userExist = await User.findOne({ email: email });
  if(userExist){
    res.status(400);
    throw new Error("user already exists");
  }

  const hashedPassword = (await bcrypt.hash(password, 12)).toString();

  const user = await User.create({email,password:hashedPassword,confirmPassword})
  if(user){
    //// send email to user after creating an account successfully
    transporter.sendMail({
      to:user.email,
      from: "emad.valencia.c.f@gmail.com",
      subject: "Signup succeeded!",
      html: "<h1> you successfully signed up </h1>",
    });
    
    res.status(200).json(user)
  } else{
    res.status(400);
    throw new Error("invalid user data, something went wrong");
  }

});



//@ route: POST/  /login
//@ description: Auth user & get JWT
//@ access: public
exports.postLoginUser = asyncHandler(async(req, res, next)=>{
  const { email, password } = req.body;
  const user = await User.findOne({email});
  if(!user){
    res.status(404);
    throw new Error("no account is attached with this email");
  }

   //check if the provided password match the password in the database
   const passwordMatch = await bcrypt.compare(password, user.password);

  if (user && passwordMatch) {
    res.json({
      _id: user._id,
      name: user.username,
      email: user.email,
      isAdmin: user.isAdmin,
      token: generateToken(user._id),
    });
  } else {
    res.status(401);
    throw new Error("invalid email or password");
  }

  
})
 