const mongoose= require('mongoose');

const Schema = mongoose.Schema;

const OrderSchema = Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        required: false,
        ref:'User'
    },

    productName:{
        type:String
    },

    productDescription:{
        type: String,
        required: true
    },

   
    price:{
        type: Number,
        required: true,
        default: 0
    },

    imageUrl:{
        type: String,
        required: true,
    },

    
    paymentMethod:{
        type: String,
        required: true,
        default: 'card'
    },

    paymentResult:{
        id:{type: String},
        status:{type: String, default:'unpaid'},
        
    },
},{
    timestamps: true
})


const Order = mongoose.model('Order', OrderSchema);

module.exports = Order;