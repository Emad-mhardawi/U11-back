const express = require('express');
const connectDb = require('./config/db')
require('dotenv').config()
const cors =require('cors');
const {notFound, errorHandler} = require('./middlewares/errorMiddleware');
const userRoutes = require('./routes/userRoutes');
const orderRoutes = require('./routes/orderRoutes');
const productRoutes = require('./routes/ProductRoute');
const orderController = require('./controllers/OrderController')
const bodyParser = require("body-parser");
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const app = express()


app.use(cors())

app.post('/webhook',express.raw({type: "application/json"}), orderController.webhook )


app.use(express.json())

app.use(orderRoutes)
app.use(userRoutes)

app.use(productRoutes)
app.use(notFound)
app.use(errorHandler)

connectDb();
const PORT = process.env.PORT || 5000;
app.listen(PORT,'0.0.0.0', console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}` ))