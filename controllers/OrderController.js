const asyncHandler = require("express-async-handler");
const bodyParser = require('body-parser');
const express = require('express');
const User = require('../models/UserModel')
exports.checkoutSession = asyncHandler(async (req,res, next)=>{
res.send('emad checkout')
}) 
