const express = require('express');
const connectDb = require('./config/db')
require('dotenv').config()
const cors =require('cors');

const app = express()

app.use(cors())
app.use('/', (req, res,next)=>{
    res.send('hello ')
})

connectDb();
const PORT = process.env.PORT || 5000;
app.listen(PORT, console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}` ))