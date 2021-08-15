const Product = require("../models/ProductModel");
const Review = require('../models/ReviewModel');
const asyncHandler = require("express-async-handler");
const bcrypt = require('bcrypt');



//@ route: POST/  /add-new-product
//@ description: add new product
//@ access: Private
exports.postAddNewProduct = asyncHandler(async(req,res,next)=>{
    const {productName, brand, inStock, price, description, rating, comments, imageUrl} = req.body;
    const product = await Product.create({productName, brand, inStock, price, description, rating, comments, imageUrl});

    if(product){
			res.status(200).json(product)
    };
    if(!product){
			res.status(400);
			throw new Error('something went wrong!')
    };
});



//@ route: GET/  /getProducts
//@ description: get all products
//@ access: public
exports.getProducts =asyncHandler(async(req, res, next)=>{
	const products = await Product.find({});
	if(products){
    res.status(200).json(products)
	}
})


//@ route: GET/  /get-Latest-products
//@ description: get latest products
//@ access: public
exports.getLatestProducts =asyncHandler(async(req, res, next)=>{
    const products = await Product.find({}).limit(8);
    res.status(200).json(products)
})


//@ route: POST/  /add-product-review
//@ description: add review to product
//@ access: public
exports.postAddReview =asyncHandler(async(req, res, next)=>{
	const {starsCount, comment, name, email, productId} = req.body;

console.log(starsCount, comment, name, email, productId)
    const product = await Product.findById(productId);
    if(product){
        const review = await Review.create({starsCount, comment, product:productId, name:name });
				if(review){
					res.status(200).json({message:'thank you for your review'})
				}else{
					res.status(400);
					throw new Error('something went wrong!')
				}
			}
})









exports.getProduct =asyncHandler(async(req, res, next)=>{
    const productId = req.query.product_id;
    const product = await Product.findById(productId);

    if(product){
        const reviews = await Review.find({product:product._id});
        const all_reviews_count = reviews.length;
        const reviewStars = [];
       reviews.map((review)=>reviewStars.push(review.starsCount))

       const averageStarCount = Math.round( reviewStars.reduce((accumulator, currentValue)=>{
           return accumulator + currentValue 
       },0)/ all_reviews_count)  || 0;

       const fiveStarCount = reviewStars.filter((five)=> five ===5).length;
       const fourStarCount = reviewStars.filter((five)=> five ===4).length;
       const threeStarCount = reviewStars.filter((five)=> five ===3).length;
       const twoStarCount = reviewStars.filter((five)=> five ===2).length;
       const oneStarCount = reviewStars.filter((five)=> five ===1).length;
       
      

       
        res.status(200).json({
            product:product,
            reviews: reviews,
            all_reviews_count: all_reviews_count,
            averageStarCount: averageStarCount,
            fiveStarCount:fiveStarCount,
            fourStarCount:fourStarCount,
            threeStarCount:threeStarCount,
            twoStarCount:twoStarCount,
            oneStarCount:oneStarCount
        })
    }
   

        
    
    
})