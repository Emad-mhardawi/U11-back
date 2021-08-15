const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ReviewsSchema = Schema({
user:{
    type: mongoose.Schema.Types.ObjectId,
    required: false,
    ref:'User'
},

starsCount:{
    type: Number,
    required: true,
    default: 0
},

comment:{
    type:String,
    required: true
},

product:{
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref:'Product'
}


},
{
    timestamps: true
}
)


const Review = mongoose.model('Review',ReviewsSchema );

module.exports = Review;