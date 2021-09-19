const User = require("../models/UserModel");
const asyncHandler = require("express-async-handler");
const generateToken = require("../utils/generateToken");
const bcrypt = require('bcrypt');
const nodemailer = require("nodemailer");
const sendgridTransport = require("nodemailer-sendgrid-transport");
const crypto = require('crypto');


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
    throw new Error("passwords don't  match");
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
    
    res.status(200).json({
      isAdmin:user.isAdmin,
      _id:user._id,
      email:user.email
    })
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




//@ route: get/  /userInfo
//@ description: get user data
//@ access: privet
exports.getUserInfo = asyncHandler(async(req, res, next)=>{
  
  try{
    const userId = req.query.userId;
    const user = await User.findById(userId);
    if(user){
      res.status(200).json({
        email:user.email,
        username: user.username,
        address:user.address,
        phoneNumber:user.phoneNumber
      })
    }else{
      res.status(404).json({message:'user not found'})
    }
    
  }catch(err){
    res.status(500).json({message: err.message})
  }
})


 

//@ route: Post /forgotPassword
//@ access: public
exports.forgotPassword = asyncHandler(async(req,res,next)=>{
  const email = req.body.email;
  if(!email){
    res.status(400);
    throw new Error("please provide an email");
  }
  
  /// find user
  const user = await User.findOne({email:email});
  if(!user){
    res.json({status:'fail', message:'"no user attached with this email"'});
  }
  
  //2 generate the random reset token
  if(user){
    const resetToken = await crypto.randomBytes(32).toString('hex');
    user.passwordResetToken= await crypto.createHash("sha256").update(resetToken).digest('hex');
    user.passwordResetExpires = await Date.now() + (10 * 60 * 1000);
    user.save();

  //3 Send reset link to user email
  const resetUrl = await `http://localhost:3000/resetPassword?resetToken=${resetToken}`;
  const resetEmail = await transporter.sendMail({
    to: user.email,
    from: "emad.valencia.c.f@gmail.com",
    subject: 'U11 Reset Password',
    html:`
    <h3>blue flame reset password</h3>
    <P> forgot your password ? please follow this link to reset your password </P>
    ${resetUrl}
    this link will be valid for only 10 minutes
    `
  });

  if(resetEmail){
    res.status(200).json({
      status:'success',
      message: "we have sent a reset password link to your email",
    });
  }else{
    res.status(500).json({
      status:'fail',
      message: "something went wrong! please try again",
    });
  }
    
  }
 })



 //@ route: POST/  /resetPassword
//@ description: change the password 
exports.resetPassword = asyncHandler(async (req, res, next) => {
  const { password, confirmPassword} = req.body;
  const resetToken = req.query.resetToken;
  if (!password || password.length < 6) {
    res.status(400);
    throw new Error("password is required and have to be at least 6 characters long");
    }
    
  if (password !== confirmPassword) {
    res.status(400);
    throw new Error("password dose not match");
  }
  
  // 1- get user based on the token
  const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex')
  
  const user = await User.findOne({
  passwordResetToken: hashedToken,
  passwordResetExpires: {$gt: Date.now()}
})

if(!user){
  res.json({message: 'your link has expired'})
}

  // 2- if token  not expired, and there is a user set new password
  if(user){
  const hashedPassword = (await bcrypt.hash(password, 12)).toString();
  res.json({message: 'you have reset your password successfully'})
  user.password = hashedPassword
  user.passwordResetToken = undefined
  user.passwordResetExpires=undefined
  user.save()
}
});


//@ route: PUT /profile
//@ description: update user profile
//@ access: private
exports.updateUserProfile = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.username = req.body.username || user.username;
    user.email = req.body.email || user.email;
    user.address.city = req.body.city || user.address.city;
    user.address.country = req.body.country || user.address.country;
    user.address.region = req.body.region || user.address.region;
    user.phoneNumber = req.body.phoneNumber || user.phoneNumber;
    
    if (req.body.newPassword) {
      if(req.body.newPassword !== req.body.confirmNewPassword){
        res.status(400);
        throw new Error("passwords don't match");
      }

      const hashedPassword = (
        await bcrypt.hash(req.body.newPassword, 12)
      ).toString();
      user.password = hashedPassword;
    }

  const updatedUser = await user.save();
    res.json({
      _id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      isAdmin: updatedUser.isAdmin,
    });
  }else{
    res.status(404);
    throw new Error("some thing went wrong");
  }
});
