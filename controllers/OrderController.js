const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const asyncHandler = require("express-async-handler");
const bodyParser = require("body-parser");
const express = require("express");
const User = require("../models/UserModel");
const Order = require("../models/OrderModel");
const Product = require("../models/ProductModel");
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

//@ route: POST/  /create-checkout-session
//@ description: create checkout session
//@ access: public
const DOMAIN = "http://localhost:3000";
exports.checkoutSession = asyncHandler(async (req, res, next) => {
  /// get card products from font end
  const cartProducts = req.body.cartProducts;
  /// loop over cart products and check if they are in our data base;
  const orderedProducts = [];
  for (const product of cartProducts) {
    const orderedProduct = await Product.findById({ _id: product.id });
    orderedProducts.push({
      productName: orderedProduct.productName,
      qty: product.qty,
      imageUrl: orderedProduct.imageUrl,
      price: orderedProduct.price,
      brand: orderedProduct.brand,
      product: orderedProduct._id,
    });
  }

  /// create new order
  /// missing fields will be stored after  payment
  const newOrder = await Order.create({
    userName: "no data yet",
    email: "no data yet",
    orderItems: orderedProducts,
    totalPrice: 0,
    shippingAddress: {
      address: {
        city: "no data yet",
        country: "no data yet",
        line1: "no data yet",
        line2: "no data yet",
        postal_code: "no data yet",
        state: "no data yet",
      },
      name: "no data yet",
    },
    paymentMethod: "no data yet",
    paymentResult: {
      id: "no data yet",
    },
    paidAt: new Date(),
  });

  //// create line items object for every ordered product this object will be passed to stripe
  const create_line_items = orderedProducts.map((product) => {
    return {
      price_data: {
        currency: "usd",
        product_data: {
          name: product.productName,
          images: [product.imageUrl],
        },
        unit_amount: product.price * 100,
      },
      quantity: product.qty,
    };
  });

  //// create checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    allow_promotion_codes: true,
    shipping_address_collection: {
      allowed_countries: ["US", "CA", "SE", "DE"],
    },
    client_reference_id: newOrder._id.toString(),
    line_items: create_line_items,
    mode: "payment",
    allow_promotion_codes: true,
    success_url: `${DOMAIN}/order-success`,
    cancel_url: `${DOMAIN}?canceled=true`,
  });

  res.json({ session_id: session.id });
});

///// this function will execute when we receive checkout.session.completed from stripe
const fulfillOrder = async (session) => {
  /// find the user who ordered in case he has an account
  const userEmail = session.customer_details.email;
  const user = await User.findOne({ email: userEmail });

  /// find the order and add missing data and change payment status to paid
  const orderId = session.client_reference_id;
  const order = await Order.findById(orderId);
  order.user = user._id;
  order.userName = session.customer_details.email;
  order.email = session.customer_details.email;
  order.totalPrice = session.amount_total / 100;
  order.shippingAddress = session.shipping;
  order.paymentMethod = session.payment_method_types[0];
  order.paymentResult = {
    id: session.payment_intent,
    status: session.payment_status,
  };
  order.paidAt = new Date();
  order.save();

  //// send email to user to confirm payment
  //// send email to user after creating an account successfully
  transporter.sendMail({
    to: userEmail,
    from: "emad.valencia.c.f@gmail.com",
    subject: "U11 order confirmation",
    html: "<h1> thank you for your order </h1>",
  });
};







//@ route: POST/  /webhook
//@ description: handling events coming from stripe to confirm payments
//@ access: private

const endpointSecret = process.env.WEB_HOOK_SECRET;
/// stripe require the row body to construct the event
exports.webhook = (req, res, next) => {
  const sig = req.headers["stripe-signature"];
  const payload = req.body;

  let event;
  try {
    event = stripe.webhooks.constructEvent(payload, sig, endpointSecret);
  } catch (err) {
    return res.send(`Webhook Error: ${err.message}`);
  }

  ///// Handle the event
  // Handle the checkout.session.completed event
  if (event.type == "checkout.session.completed") {
    const session = event.data.object;
    // Fulfill the purchase...
    fulfillOrder(session);
  }
};
