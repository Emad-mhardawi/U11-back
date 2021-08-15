const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ProductSchema = Schema({
productName:{
    type: String,
    required: true
},

brand:{
    type: String,
    required: true
},

inStock:{
    type: Number,
    required: true
},

price:{
    type: Number,
    required: true
},

description:{
    type: String,
    required: true
},

rating:{
    type: Number,
    default: 0
},


imageUrl:{
type: String
},
user:{
    type: mongoose.Schema.Types.ObjectId,
    required: false,
    ref:'User'
    }


},
{
    timestamps: true
}
)


const Product = mongoose.model('Product',ProductSchema );

module.exports = Product;