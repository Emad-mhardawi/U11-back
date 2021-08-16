const express = require('express');
const connectDb = require('./config/db')
require('dotenv').config()
const cors =require('cors');
const {notFound, errorHandler} = require('./middlewares/errorMiddleware');
const userRoutes = require('./routes/userRoutes');
const orderRoutes = require('./routes/orderRoutes');
const productRoutes = require('./routes/ProductRoute');
const orderController = require('./controllers/orderController')

const app = express()

app.use(cors())


/*
// Use JSON parser for all non-webhook routes
app.use((req, res, next) => {
    if (req.originalUrl === '/webhook') {
        console.log(req.originalUrl)
      next();
    } else {
      express.json()(req, res, next);
    }
  });
*/


app.post('/webhook', orderController.webhook )

app.use(express.json())
app.use(orderRoutes)
app.use(userRoutes)

app.use(productRoutes)
app.use(notFound)
app.use(errorHandler)

connectDb();
const PORT = process.env.PORT || 5000;
app.listen(PORT, console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}` ))