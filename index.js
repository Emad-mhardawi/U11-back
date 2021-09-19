const express = require('express');
const connectDb = require('./config/db')
require('dotenv').config()
const cors =require('cors');
const {notFound, errorHandler} = require('./middlewares/errorMiddleware');
const userRoutes = require('./routes/userRoutes');
const orderRoutes = require('./routes/orderRoutes');
const productRoutes = require('./routes/ProductRoute');
const orderController = require('./controllers/OrderController')
const app = express()


app.use(cors())

/// expect request body to be in a raw format
app.post('/webhook',express.raw({type: "application/json"}), orderController.webhook )

app.use(express.json())

app.use(orderRoutes)
app.use(userRoutes)
app.use(productRoutes)
app.use(notFound)
app.use(errorHandler)

/// connect to data base
connectDb();
const PORT = process.env.PORT || 5000;
app.listen(PORT, console.log(`Server running  on port ${PORT}` ))