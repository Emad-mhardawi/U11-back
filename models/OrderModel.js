const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const OrderSchema = Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
      ref: "User",
    },
    
    userName: {
      type:String,
      required:true
    },
    
    email: {
      type:String,
      required:true
    },

    orderItems: [
      {
        productName: { type: String, required: true },
        qty: { type: Number, required: true },
        imageUrl: { type: String, required: false },
        price: { type: Number, required: true },
        brand: { type: String, required: true },
        product: {
          type: mongoose.Schema.Types.ObjectId,
          require: true,
          ref: "Product",
        },
      },
    ],
    
    totalPrice:{
      type:Number,
      required: true
    },
    
    shippingAddress:{
      address:{
        city:{type:String, required:true},
        country:{type:String, required:true},
        line1:{type:String, required:true},
        line2:{type:String, required:false},
        postal_code:{type:String, required:true},
        state:{type:String, required:false}
      },
      name:{type:String, required:true}
    },
    
    paymentMethod: {
      type: String,
      required: true,
    },

    paymentResult: {
      id: { type: String },
      status: { type: String, default: "unpaid" },
    },

    paidAt:{
    type:Date
    },

    isDeliverd:{
      type: Boolean,
      required: true,
      default: false
    },


  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model("Order", OrderSchema);

module.exports = Order;
