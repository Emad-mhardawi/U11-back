const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const asyncHandler = require("express-async-handler");
const bodyParser = require('body-parser');
const express = require('express');
const User = require('../models/UserModel');
const Order = require('../models/OrderModel');
const Product = require('../models/ProductModel');



const DOMAIN = 'http://localhost:3000'
exports.checkoutSession = asyncHandler(async (req,res, next)=>{
const cartProducts = req.body.cartProducts;
const orderedProducts =[];
let newOrder;
for(const product of cartProducts ){
    const orderedProduct = await Product.findById({_id:product.id})
    orderedProducts.push(orderedProduct)

     newOrder = await new Order({
        productName: product.productName,
        price:product.price,
        imageUrl:product.imageUrl,
        paymentMethod:'card',
        paymentResult:{
            id:null,
            status:'unpaid'
        }
        
    });

    
}
const create_line_items = orderedProducts.map(product=>{
    
    return{
        price_data:{
            currency: 'usd',
            product_data:{
                name: product.productName,
                images: [product.imageUrl],
               
            },
            unit_amount: product.price * 100,
            
        },
        quantity: cartProducts.find(prod=>prod.id ===product.id).qty
    }
}) 


   
    
const session = await stripe.checkout.sessions.create({
    payment_method_types : ['card'],
    customer_email: 'emad.valencia.c.f@gmail.com',
    allow_promotion_codes: true,
    shipping_address_collection: {
        allowed_countries: ['US', 'CA', 'SE', 'DE'],
      },
    client_reference_id: newOrder._id.toString(),
    line_items :create_line_items,
        mode: 'payment',
        allow_promotion_codes: true,
        success_url: `${DOMAIN}/order-success`,
        cancel_url: `${DOMAIN}?canceled=true`,
        
});
res.json({session_id:session.id})

})






const fulfillOrder = async(session) => {
    // TODO: fill me in
    /*const orderId = session.client_reference_id;
    const order = await Order.findById(orderId);
    order.paymentResult.status = session.payment_status;
    order.save()
    */
   
    console.log(session)
    
  }


const endpointSecret =process.env.WEB_HOOK_SECRET;
/// stripe require the row body to construct the event
exports.webhook = asyncHandler( express.raw({type: 'application/json'}), async (req, res, next)=>{
    
   
    const payload = req.body;
    const sig = req.headers['stripe-signature'];
  
    console.log(sig)
    let event;
  
    try {
      event = stripe.webhooks.constructEvent(payload, sig, endpointSecret);
    } catch (err) {
        console.log(err)
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
  
    // Handle the checkout.session.completed event
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
  
      // Fulfill the purchase...
      fulfillOrder(session);
      
    }
  
    res.status(200);

}) 

